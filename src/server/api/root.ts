import { createTRPCRouter } from "~/server/api/trpc";
import {  rocketsRouter } from "~/server/api/routers/rockets";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  rockets: rocketsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
