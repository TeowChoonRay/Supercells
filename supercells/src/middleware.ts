// src/middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Make dashboard pages public but protect API routes that modify data
  publicRoutes: [
    "/",
    "/dashboard", 
    "/dashboard/(.*)", // Allow all dashboard routes to be viewed
    "/api/trpc/leads.getAll", // Allow fetching leads list without auth
    "/api/trpc/leads.getQualified", // Allow fetching qualified leads without auth
  ],
  // Protect mutation endpoints and sensitive data
  ignoredRoutes: [
    // These will require authentication
    "/api/trpc/leads.create",
    "/api/trpc/leads.update",
    "/api/trpc/leads.delete",
  ]
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};