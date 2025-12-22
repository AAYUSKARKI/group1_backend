// model SurplusMark {
//   id           String   @id @default(uuid())
//   createdAt    DateTime @default(now())
//   updatedAt    DateTime @updatedAt
//   deletedAt    DateTime?
//   menuItemId   String
//   markedBy     String   // FK to User.id
//   surplusAt    DateTime // When it becomes visible
//   surplusUntil DateTime // When sale ends (helpful for queries)
//   discountPct  Decimal  @db.Decimal(5, 2) // e.g., 30.00 -> 30%
//   note         String?

//   // Relations
//   menuItem     MenuItem @relation("SurplusForMenuItem", fields: [menuItemId], references: [id], onDelete: Cascade, onUpdate: Cascade)
//   marker       User     @relation("SurplusMarker", fields: [markedBy], references: [id], onDelete: Restrict, onUpdate: Cascade)

//   @@unique([menuItemId, surplusAt]) // one active mark per exact start time
//   @@index([surplusAt, surplusUntil, menuItemId])
//   @@index([deletedAt])
// }
import { Prisma } from "@/generated/prisma/client";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const surplusMarkSchema = z.object({
    id: z.string().openapi({ description: "Unique identifier for the surplus mark", example: "123e4567-e89b-12d3-a456-426655440000" }),
    createdAt: z.date().openapi({ description: "Date and time when the surplus mark was created", example: "2022-01-01T00:00:00.000Z" }),
    updatedAt: z.date().openapi({ description: "Date and time when the surplus mark was last updated", example: "2022-01-01T00:00:00.000Z" }),
    deletedAt: z.date().nullable().openapi({ description: "Date and time when the surplus mark was deleted", example: "2022-01-01T00:00:00.000Z" }),
    menuItemId: z.string().openapi({ description: "Unique identifier for the menu item", example: "123e4567-e89b-12d3-a456-426655440000" }),
    markedBy: z.string().openapi({ description: "Unique identifier for the user who marked the surplus", example: "123e4567-e89b-12d3-a456-426655440000" }),
    surplusAt: z.date().openapi({ description: "Date and time when the surplus becomes visible", example: "2022-01-01T00:00:00.000Z" }),
    surplusUntil: z.date().openapi({ description: "Date and time when the sale ends", example: "2022-01-01T00:00:00.000Z" }),
    discountPct: z.union([z.string(), z.number()]).transform((val) => new Prisma.Decimal(val)).openapi({ description: "Percentage discount applied to the menu item", example: 30.00 }),
    note: z.string().nullable().openapi({ description: "Additional notes about the surplus mark", example: "Limited quantity available" }),
});

export const CreateSurplusMarkSchema = surplusMarkSchema.pick({
    menuItemId: true,
    surplusAt: true,
    surplusUntil: true,
    discountPct: true,
    note: true,
}).refine((data) => data.surplusUntil > data.surplusAt, {
    message: "Sale end time must be after the start time",
    path: ["surplusUntil"],
}).refine((data) => data.surplusAt >= new Date(new Date().setSeconds(0,0)), {
    message: "Start time cannot be in the past",
    path: ["surplusAt"],
});

export const UpdateSurplusMarkSchema = surplusMarkSchema.pick({
    discountPct: true,
    note: true,
});

export const SurplusMarkResponseSchema = surplusMarkSchema.pick({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    menuItemId: true,
    markedBy: true,
    surplusAt: true,
    surplusUntil: true,
    discountPct: true,
    note: true,
});

export type SurplusMark = z.infer<typeof surplusMarkSchema>;
export type CreateSurplusMark = z.infer<typeof CreateSurplusMarkSchema>;
export type UpdateSurplusMark = z.infer<typeof UpdateSurplusMarkSchema>;
export type SurplusMarkResponse = z.infer<typeof SurplusMarkResponseSchema>;