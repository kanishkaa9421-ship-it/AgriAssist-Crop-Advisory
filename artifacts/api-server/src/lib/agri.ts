import { z } from "zod";

export const advisoryResponseSchema = z.object({
  primary_diagnosis: z.string(),
  confidence_level: z.enum(["High", "Medium", "Low"]),
  immediate_actions: z.array(z.string()).min(1).max(3),
  treatment_plan: z.array(
    z.object({
      step_number: z.number(),
      description: z.string(),
      type: z.enum(["Organic", "Chemical", "Cultural", "Market"]),
    }),
  ),
  preventative_measures: z.array(z.string()),
});

export const advisoryResponseSchemaForGemini = {
  type: "OBJECT",
  properties: {
    primary_diagnosis: { type: "STRING", description: "Most likely issue or disease." },
    confidence_level: { type: "STRING", enum: ["High", "Medium", "Low"] },
    immediate_actions: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "One to three critical steps for the next 24 hours.",
    },
    treatment_plan: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          step_number: { type: "NUMBER" },
          description: { type: "STRING" },
          type: { type: "STRING", enum: ["Organic", "Chemical", "Cultural", "Market"] },
        },
        required: ["step_number", "description", "type"],
      },
    },
    preventative_measures: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
  },
  required: [
    "primary_diagnosis",
    "confidence_level",
    "immediate_actions",
    "treatment_plan",
    "preventative_measures",
  ],
} as const;

export const cropIcons: Record<string, string> = {
  Vegetables: "sprout",
  Fruits: "apple",
  "Cereals & Grains": "wheat",
  "Cash Crops": "leaf",
  Legumes: "bean",
};

export function daysSince(dateValue: string | Date): number {
  const date = typeof dateValue === "string" ? new Date(`${dateValue}T00:00:00`) : dateValue;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
}

export function cropDto(crop: {
  id: string;
  cropName: string;
  cropCategory: string;
  plantingDate: string;
  acreage: number | null;
  createdAt: Date;
}) {
  return {
    id: crop.id,
    crop_name: crop.cropName,
    crop_category: crop.cropCategory,
    planting_date: new Date(`${crop.plantingDate}T00:00:00Z`),
    acreage: crop.acreage,
    created_at: crop.createdAt,
    days_since_planting: daysSince(crop.plantingDate),
    icon: cropIcons[crop.cropCategory] ?? "leaf",
  };
}

export function advisorySummaryDto(
  advisory: {
    id: string;
    cropId: string;
    cropName: string;
    advisoryType: string;
    symptomsDescription: string;
    aiResponse: unknown;
    createdAt: Date;
  },
) {
  const response = advisoryResponseSchema.parse(advisory.aiResponse);
  return {
    id: advisory.id,
    crop_id: advisory.cropId,
    crop_name: advisory.cropName,
    advisory_type: advisory.advisoryType,
    symptoms_description: advisory.symptomsDescription,
    primary_diagnosis: response.primary_diagnosis,
    confidence_level: response.confidence_level,
    created_at: advisory.createdAt,
  };
}