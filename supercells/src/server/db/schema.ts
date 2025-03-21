// src/db/schema.ts
import { sql } from "drizzle-orm";
import { 
  pgTable, 
  varchar, 
  timestamp, 
  serial, 
  text, 
  integer, 
  boolean,
  json
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Companies table (leads)
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  website: varchar("website", { length: 256 }).notNull().unique(),
  industry: varchar("industry", { length: 128 }),
  size: varchar("size", { length: 64 }),
  aiInterestLevel: integer("ai_interest_level").default(0),
  aiEvidence: text("ai_evidence"),
  leadScore: integer("lead_score").default(0),
  isQualified: boolean("is_qualified").default(false),
  lastScanned: timestamp("last_scanned").defaultNow(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Web content/history table
export const webContents = pgTable("web_contents", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  url: varchar("url", { length: 512 }).notNull(),
  contentType: varchar("content_type", { length: 64 }).notNull(),
  content: text("content"),
  aiAnalysis: json("ai_analysis").$type<Record<string, unknown>>(),
  scannedAt: timestamp("scanned_at").defaultNow(),
});

// Insert/select schemas for validation with Zod
export const insertCompanySchema = createInsertSchema(companies);
export const selectCompanySchema = createSelectSchema(companies);
export const insertWebContentSchema = createInsertSchema(webContents);
export const selectWebContentSchema = createSelectSchema(webContents);

// Custom Zod schema for lead qualification
export const leadQualificationSchema = z.object({
  website: z.string().url(),
  aiInterestLevel: z.number().min(0).max(10),
  aiEvidence: z.string().optional(),
  leadScore: z.number(),
  isQualified: z.boolean(),
});