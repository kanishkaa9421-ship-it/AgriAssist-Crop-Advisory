import { GoogleGenAI } from "@google/genai";
import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db, advisoryLogsTable, cropsTable, usersTable } from "@workspace/db";
import {
  CreateAdvisoryBody,
  CreateAdvisoryResponse,
  CreateCropBody,
  CreateCropResponse,
  DeleteCropParams,
  GetAdvisoryParams,
  GetAdvisoryResponse,
  GetDashboardResponse,
  ListAdvisoryHistoryResponse,
  ListCropsResponse,
} from "@workspace/api-zod";
import { getUserId } from "../middlewares/auth";
import {
  advisoryResponseSchema,
  advisoryResponseSchemaForGemini,
  advisorySummaryDto,
  cropDto,
  daysSince,
} from "../lib/agri";

const router: IRouter = Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const advisoryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "You have reached the advisory limit. Please try again later." },
});

async function ensureUser(userId: string): Promise<void> {
  await db
    .insert(usersTable)
    .values({ id: userId, email: `farmer-${userId.slice(0, 8)}@agriassist.local` })
    .onConflictDoNothing();
}

async function getAdvisoryRows(userId: string, limit?: number) {
  const query = db
    .select({
      id: advisoryLogsTable.id,
      cropId: advisoryLogsTable.cropId,
      cropName: cropsTable.cropName,
      advisoryType: advisoryLogsTable.advisoryType,
      currentWeather: advisoryLogsTable.currentWeather,
      soilType: advisoryLogsTable.soilType,
      symptomsDescription: advisoryLogsTable.symptomsDescription,
      aiResponse: advisoryLogsTable.aiResponse,
      createdAt: advisoryLogsTable.createdAt,
    })
    .from(advisoryLogsTable)
    .innerJoin(cropsTable, eq(advisoryLogsTable.cropId, cropsTable.id))
    .where(eq(advisoryLogsTable.userId, userId))
    .orderBy(desc(advisoryLogsTable.createdAt));

  return limit ? query.limit(limit) : query;
}

function responseError(res: Parameters<Parameters<IRouter["post"]>[1]>[1], status: number, error: string) {
  res.status(status).json({ error });
}

router.get("/dashboard", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  await ensureUser(userId);
  const crops = await db.select().from(cropsTable).where(eq(cropsTable.userId, userId)).orderBy(desc(cropsTable.createdAt));
  const recent = await getAdvisoryRows(userId, 4);
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthAdvisories = await db
    .select({ count: sql<number>`count(*)` })
    .from(advisoryLogsTable)
    .where(and(eq(advisoryLogsTable.userId, userId), gte(advisoryLogsTable.createdAt, monthStart)));

  const result = {
    total_crops: crops.length,
    advisories_this_month: Number(monthAdvisories[0]?.count ?? 0),
    attention_needed: recent.filter((item) => {
      const parsed = advisoryResponseSchema.safeParse(item.aiResponse);
      return parsed.success && parsed.data.confidence_level !== "High";
    }).length,
    latest_weather: {
      label: "Today on your farm",
      temperature: "28°C",
      description: "Warm with a chance of late afternoon showers",
      severity: "moderate" as const,
    },
    recent_advisories: recent.map(advisorySummaryDto),
    crops: crops.map(cropDto),
  };
  res.json(GetDashboardResponse.parse(result));
});

router.get("/crops", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  await ensureUser(userId);
  const crops = await db.select().from(cropsTable).where(eq(cropsTable.userId, userId)).orderBy(desc(cropsTable.createdAt));
  res.json(ListCropsResponse.parse(crops.map(cropDto)));
});

router.post("/crops", async (req, res): Promise<void> => {
  const parsed = CreateCropBody.safeParse(req.body);
  if (!parsed.success) {
    responseError(res, 400, parsed.error.message);
    return;
  }
  const userId = getUserId(req);
  await ensureUser(userId);
  const [crop] = await db
    .insert(cropsTable)
    .values({
      userId,
      cropName: parsed.data.crop_name,
      cropCategory: parsed.data.crop_category,
      plantingDate: parsed.data.planting_date.toISOString().slice(0, 10),
      acreage: parsed.data.acreage ?? null,
    })
    .returning();
  res.status(201).json(CreateCropResponse.parse(cropDto(crop)));
});

router.delete("/crops/:id", async (req, res): Promise<void> => {
  const params = DeleteCropParams.safeParse(req.params);
  if (!params.success) {
    responseError(res, 400, params.error.message);
    return;
  }
  const deleted = await db
    .delete(cropsTable)
    .where(and(eq(cropsTable.id, params.data.id), eq(cropsTable.userId, getUserId(req))))
    .returning({ id: cropsTable.id });
  if (!deleted.length) {
    responseError(res, 404, "Crop not found");
    return;
  }
  res.sendStatus(204);
});

router.get("/history", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  await ensureUser(userId);
  const rows = await getAdvisoryRows(userId);
  res.json(ListAdvisoryHistoryResponse.parse(rows.map(advisorySummaryDto)));
});

router.get("/advisory/:id", async (req, res): Promise<void> => {
  const params = GetAdvisoryParams.safeParse(req.params);
  if (!params.success) {
    responseError(res, 400, params.error.message);
    return;
  }
  const [advisory] = await getAdvisoryRows(getUserId(req)).then((rows) =>
    rows.filter((row) => row.id === params.data.id),
  );
  if (!advisory) {
    responseError(res, 404, "Advisory not found");
    return;
  }
  const summary = advisorySummaryDto(advisory);
  const response = advisoryResponseSchema.parse(advisory.aiResponse);
  res.json(
    GetAdvisoryResponse.parse({
      ...summary,
      current_weather: advisory.currentWeather,
      soil_type: advisory.soilType,
      ai_response: response,
    }),
  );
});

router.post("/advisory", advisoryLimiter, async (req, res): Promise<void> => {
  const parsed = CreateAdvisoryBody.safeParse(req.body);
  if (!parsed.success) {
    responseError(res, 400, parsed.error.message);
    return;
  }
  const userId = getUserId(req);
  await ensureUser(userId);
  const [crop] = await db
    .select()
    .from(cropsTable)
    .where(and(eq(cropsTable.id, parsed.data.crop_id), eq(cropsTable.userId, userId)));
  if (!crop) {
    responseError(res, 404, "Crop not found");
    return;
  }
  if (!process.env.GEMINI_API_KEY) {
    responseError(res, 503, "Gemini is not configured yet.");
    return;
  }

  const prompt = `Analyze the following crop issue:
Crop: ${crop.cropName} (Planted: ${daysSince(crop.plantingDate)} days ago)
Issue Type: ${parsed.data.advisory_type}
Symptoms/Context: ${parsed.data.symptoms_description}
Weather Context: ${parsed.data.current_weather}
Soil Type: ${parsed.data.soil_type ?? "Not provided"}
Provide a safe, practical diagnosis and an actionable step-by-step treatment plan. Prioritize organic and low-cost interventions before chemical treatments.`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are AgriAssist, an expert agricultural AI. Be practical, safe, and highly structured. Always prioritize organic and low-cost interventions first. If an issue sounds dangerous or unrecoverable, advise consulting a local agricultural extension office immediately.",
        responseMimeType: "application/json",
        responseSchema: advisoryResponseSchemaForGemini,
        maxOutputTokens: 8192,
      },
    });
    const aiResponse = advisoryResponseSchema.parse(JSON.parse(result.text ?? ""));
    const [saved] = await db
      .insert(advisoryLogsTable)
      .values({
        userId,
        cropId: crop.id,
        advisoryType: parsed.data.advisory_type,
        currentWeather: parsed.data.current_weather,
        soilType: parsed.data.soil_type ?? null,
        symptomsDescription: parsed.data.symptoms_description,
        aiResponse,
      })
      .returning();

    const summary = advisorySummaryDto({
      ...saved,
      cropName: crop.cropName,
    });
    res.status(201).json(
      CreateAdvisoryResponse.parse({
        ...summary,
        current_weather: saved.currentWeather,
        soil_type: saved.soilType,
        ai_response: aiResponse,
      }),
    );
  } catch (error) {
    req.log.error({ err: error }, "Gemini advisory generation failed");
    responseError(res, 502, "The advisory service could not produce a valid recommendation. Please try again.");
  }
});

export default router;