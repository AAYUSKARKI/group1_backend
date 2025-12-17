import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateMenuItemSchema, menuItemSchema, MenuItemResponseSchema } from "./menuItemModel";
import { StatusCodes } from "http-status-codes";
import { verifyJWT } from "@/common/middleware/verifyJWT";
import { checkRole } from "@/common/middleware/verifyRole";
import { menuItemController } from "./menuItemController";
import { upload } from "@/common/middleware/multer";
import z from "zod";

export const menuItemRegistry = new OpenAPIRegistry();
export const menuItemRouter: Router = Router();

menuItemRegistry.register("MenuItem", menuItemSchema);

menuItemRegistry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});

menuItemRegistry.registerPath({
    method: "post",
    path: "/api/menu-item",
    summary: "Create a new menu item",
    tags: ["MenuItem"],
    request: {
        body: {
            description: "Menu item object that needs to be created",
            required: true,
            content: {
                "multipart/form-data": {
                    schema: CreateMenuItemSchema.extend({
                        menuImage: z.custom<Express.Multer.File>().openapi({
                            type: "string",
                            format: "binary",
                            description: "Image file for the menu item",
                        }),
                    }),
                },
            },
        },
    },
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(MenuItemResponseSchema, "Menu item created successfully", StatusCodes.CREATED),
});

menuItemRouter.post("/menu-item", verifyJWT, checkRole(["ADMIN"]), upload.single("menuImage"), menuItemController.createMenuItem);