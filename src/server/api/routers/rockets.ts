import { z } from "zod";

import {
    createTRPCRouter,
    publicProcedure,
} from "~/server/api/trpc";

export const rocketsRouter = createTRPCRouter({


    getAll: publicProcedure.query(({ ctx }) => {
        return ctx.prisma.rocket.findMany();
    }),

});
