import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateSurplusMarkSchema, SurplusMarkResponseSchema } from "./surplusModel";
import { StatusCodes } from "http-status-codes";
import { surplusController } from "./surplusController";
import { verifyJWT } from "@/common/middleware/verifyJWT";
import { checkRole } from "@/common/middleware/verifyRole";
import { Role } from "@/generated/prisma/enums";

export const surplusRegistry = new OpenAPIRegistry();
export const surplusRouter: Router = Router();

surplusRegistry.register("SurplusMark", SurplusMarkResponseSchema);

surplusRegistry.registerComponent("securitySchemes","bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});

surplusRegistry.registerPath({
    method: "post",
    path: "/api/surplus",
    summary: "Create a new surplus mark",
    tags: ["Surplus"],
    request: {
        body: {
            description: "Surplus mark object that needs to be created",
            required: true,
            content: {
                "application/json": {
                    schema: CreateSurplusMarkSchema,
                },
            },
        },
    },
    responses: createApiResponse(SurplusMarkResponseSchema, "Surplus mark created successfully", StatusCodes.CREATED),
    security: [{ bearerAuth: [] }],
});

surplusRouter.post("/surplus", verifyJWT, checkRole([Role.ADMIN, Role.KITCHEN]), surplusController.createSurplusMark);

