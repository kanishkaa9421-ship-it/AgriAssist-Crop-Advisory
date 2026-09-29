import { createInsertSchema } from "drizzle-zod";
import {
  date,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cropsTable = pgTable("crops", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  cropName: varchar("crop_name", { length: 100 }).notNull(),
  cropCategory: varchar("crop_category", { length: 50 }).notNull(),
  plantingDate: date("planting_date", { mode: "string" }).notNull(),
  acreage: numeric("acreage", { precision: 10, scale: 2, mode: "number" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const advisoryLogsTable = pgTable("advisory_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  cropId: uuid("crop_id").references(() => cropsTable.id, { onDelete: "cascade" }).notNull(),
  advisoryType: varchar("advisory_type", { length: 50 }).notNull(),
  currentWeather: text("current_weather").notNull(),
  soilType: varchar("soil_type", { length: 30 }),
  symptomsDescription: text("symptoms_description").notNull(),
  aiResponse: jsonb("ai_response").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
});
export const insertCropSchema = createInsertSchema(cropsTable).omit({
  id: true,
  createdAt: true,
});
export const insertAdvisoryLogSchema = createInsertSchema(advisoryLogsTable).omit({
  id: true,
  createdAt: true,
});

export type User = typeof usersTable.$inferSelect;
export type Crop = typeof cropsTable.$inferSelect;
export type AdvisoryLog = typeof advisoryLogsTable.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCrop = z.infer<typeof insertCropSchema>;
export type InsertAdvisoryLog = z.infer<typeof insertAdvisoryLogSchema>;