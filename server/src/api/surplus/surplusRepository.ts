import { prisma } from "@/common/lib/prisma";
import { CreateSurplusMark, SurplusMarkResponse } from "./surplusModel";

export class SurplusRepository {
    async createSurplusMark(surplusMark: CreateSurplusMark, markedBy: string): Promise<SurplusMarkResponse> {
        const surplusMarkResponse = await prisma.surplusMark.create({
            data: {
                ...surplusMark,
                markedBy,
            },
        });
        return surplusMarkResponse;
    }

    async findOverlappingMark(menuItemId: string, start: Date, end: Date): Promise<boolean> {
        const overlap = await prisma.surplusMark.findFirst({
            where: {
                menuItemId,
                deletedAt: null,
                OR: [
                    {
                        // New sale starts during an existing sale
                        surplusAt: { lte: end },
                        surplusUntil: { gte: start }
                    }
                ]
            }
        });
        return !!overlap;
    }
}