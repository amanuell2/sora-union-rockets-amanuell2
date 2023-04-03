import { type User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import Trpc from "~/pages/api/trpc/[trpc]";

import {
    createTRPCRouter,
    publicProcedure,
} from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
    return {
        id: user.id,
        name: user.username,
        profilePicture: user.profileImageUrl,
    }
}
export const rocketsRouter = createTRPCRouter({


    getAll: publicProcedure.query(async ({ ctx }) => {
        const rockets = await ctx.prisma.rocket.findMany({
            take: 100,
        });

        const user = (await clerkClient.users.getUserList({
            userId: rockets.map((rocket) => rocket.authorId),
            limit: 100,
        })).map(filterUserForClient);

        return rockets.map((rocket) => {
            const author = user.find((user) => user.id === rocket.authorId);

            if (!author || !author.name) throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Author not found',
            })

            return {
                rocket,
                author:{
                    ...author,
                    name: author.name,
                }
            }
        });
    }),

});
