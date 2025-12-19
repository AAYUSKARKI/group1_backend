import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateOrderSchema, orderSchema, OrderResponseSchema } from "./orderModel";
import { StatusCodes } from "http-status-codes";
import { orderController } from "./orderController";
import { optionalJwt } from "@/common/middleware/optionalJwt";
import { verifyJWT } from "@/common/middleware/verifyJWT";

export const orderRegistry = new OpenAPIRegistry();
export const orderRouter: Router = Router();

orderRegistry.registerComponent("securitySchemes","bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});

orderRegistry.register("Order",orderSchema);

orderRegistry.registerPath({
    method: "post",
    path: "/api/order",
    summary: "Create a new order",
    tags: ["Order"],
    request: {
        body: {
            description: "Order object that needs to be created",
            required: true,
            content: {
                "application/json": {
                    schema: CreateOrderSchema,
                },
            },
        },
    },
    responses: createApiResponse(OrderResponseSchema, "Order created successfully", StatusCodes.CREATED),
    security: [{ bearerAuth: [] }],
});

orderRouter.post("/order",optionalJwt, orderController.createOrder);

orderRegistry.registerPath({
    method: "get",
    path: "/api/order/{id}",
    summary: "Get order by ID",
    tags: ["Order"],
    parameters: [
        {
            name: "id",
            in: "path",
            description: "ID of the order to get",
            required: true,
            schema: {
                type: "string",
            },
        },
    ],
    responses: createApiResponse(OrderResponseSchema, "Order found successfully", StatusCodes.OK),
    security: [{ bearerAuth: [] }],
});

orderRouter.get("/order/:id", verifyJWT, orderController.getOrderById);

orderRegistry.registerPath({
    method: "get",
    path: "/api/order",
    summary: "Get all orders",
    tags: ["Order"],
    responses: createApiResponse(OrderResponseSchema.array(), "Orders found successfully", StatusCodes.OK),
    security: [{ bearerAuth: [] }],
});

orderRouter.get("/order", verifyJWT, orderController.getAllOrders);
