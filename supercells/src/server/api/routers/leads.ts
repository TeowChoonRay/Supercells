// src/server/api/routers/leads.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { companies, insertCompanySchema } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { analyzeAndStoreLead } from "~/server/services/leadAnalysis";
import { TRPCError } from "@trpc/server";

export const leadsRouter = createTRPCRouter({
  // Get all leads
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      const allLeads = await ctx.db.select().from(companies).orderBy(companies.leadScore);
      return allLeads;
    }),

  // Get top qualified leads
  getQualified: publicProcedure
    .query(async ({ ctx }) => {
      const qualifiedLeads = await ctx.db
        .select()
        .from(companies)
        .where(eq(companies.isQualified, true))
        .orderBy(companies.leadScore);
      return qualifiedLeads;
    }),

  // Get single lead by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const lead = await ctx.db
        .select()
        .from(companies)
        .where(eq(companies.id, input.id));
      
      if (!lead.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Lead with ID ${input.id} not found`,
        });
      }
      
      return lead[0];
    }),

  // Create new lead
  create: protectedProcedure
    .input(insertCompanySchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.insert(companies)
        .values({
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({
          id: companies.id,
          name: companies.name,
          website: companies.website,
          industry: companies.industry,
          size: companies.size,
          aiInterestLevel: companies.aiInterestLevel,
          aiEvidence: companies.aiEvidence,
          leadScore: companies.leadScore,
          isQualified: companies.isQualified,
          lastScanned: companies.lastScanned,
          createdAt: companies.createdAt,
          updatedAt: companies.updatedAt,
        });
      
      return result[0];
    }),

  // Update lead
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: insertCompanySchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .update(companies)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(companies.id, input.id))
        .returning({
          id: companies.id,
          name: companies.name,
          website: companies.website,
          industry: companies.industry,
          size: companies.size,
          aiInterestLevel: companies.aiInterestLevel,
          aiEvidence: companies.aiEvidence,
          leadScore: companies.leadScore,
          isQualified: companies.isQualified,
          lastScanned: companies.lastScanned,
          updatedAt: companies.updatedAt,
        });
      
      if (!result.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Lead with ID ${input.id} not found`,
        });
      }
      
      return result[0];
    }),

  // Delete lead
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(companies)
        .where(eq(companies.id, input.id));
      
      return { success: true };
    }),
    
  // Analyze a lead with AI
  analyzeLead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const analysis = await analyzeAndStoreLead(input.id);
      
      if (!analysis) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze lead",
        });
      }
      
      return analysis;
    }),
    
  // Analyze all leads that haven't been scanned recently
  analyzeAllLeads: protectedProcedure
    .input(z.object({ 
      olderThanHours: z.number().optional().default(24) 
    }))
    .mutation(async ({ ctx, input }) => {
      // Find leads that haven't been scanned in the specified time
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - input.olderThanHours);
      
      const leadsToAnalyze = await ctx.db
        .select({ id: companies.id, name: companies.name })
        .from(companies)
        .where(
          eq(companies.lastScanned, null) || 
          (companies.lastScanned < cutoffDate)
        );
      
      // Process each lead (we could do this in parallel, but sequential is safer for API limits)
      const results = [];
      for (const lead of leadsToAnalyze) {
        try {
          const analysis = await analyzeAndStoreLead(lead.id);
          if (analysis) {
            results.push({
              id: lead.id,
              name: lead.name,
              success: true,
              analysis,
            });
          } else {
            results.push({
              id: lead.id,
              name: lead.name,
              success: false,
              error: "Analysis failed",
            });
          }
        } catch (error) {
          results.push({
            id: lead.id,
            name: lead.name,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
      
      return {
        processed: results.length,
        results,
      };
    }),
});