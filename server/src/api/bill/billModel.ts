import { Prisma } from "@/generated/prisma/client";
import { DiscountType, PaymentMode } from "@/generated/prisma/enums";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { OrderResponseSchema } from "../order/orderModel";

extendZodWithOpenApi(z);

export const billSchema = z.object({
    id: z.string().openapi({ description: "Unique identifier for the bill", example: "123e4567-e89b-12d3-a456-426655440000" }),
    createdAt: z.date().openapi({ description: "Bill creation timestamp", example: "2024-01-01T12:00:00Z" }),
    updatedAt: z.date().openapi({ description: "Bill last updated timestamp", example: "2024-01-01T12:00:00Z" }),
    deletedAt: z.date().nullable().openapi({ description: "Bill deletion timestamp", example: "2024-01-01T12:00:00Z" }),
    orderId: z.string().openapi({ description: "ID of the order associated with this bill", example: "123e4567-e89b-12d3-a456-426655440000" }),
    generatedAt: z.date().openapi({ description: "Timestamp when the bill was generated", example: "2024-01-01T12:00:00Z" }),
    generatedBy: z.string().openapi({ description: "User ID who generated the bill", example: "123e4567-e89b-12d3-a456-426655440000" }),
    subTotal: z.union([z.string(), z.number()]).transform((val) => new Prisma.Decimal(val)).openapi({ description: "Subtotal for the bill", example: 19.99 }),
    discountValue: z.union([z.string(), z.number()]).transform((val) => new Prisma.Decimal(val)).openapi({ description: "Discount value applied to the bill", example: 0 }),
    discountType: z.enum(DiscountType).openapi({ description: "Type of discount applied to the bill", example: "PERCENTAGE" }),
    serviceCharge: z.union([z.string(), z.number()]).transform((val) => new Prisma.Decimal(val)).openapi({ description: "Service charge applied to the bill", example: 0 }),
    taxPct: z.union([z.string(), z.number()]).transform((val) => new Prisma.Decimal(val)).openapi({ description: "Tax percentage applied to the bill", example: 13 }),
    taxAmount: z.union([z.string(), z.number()]).transform((val) => new Prisma.Decimal(val)).openapi({ description: "Tax amount calculated for the bill", example: 1.29 }),
    grandTotal: z.union([z.string(), z.number()]).transform((val) => new Prisma.Decimal(val)).openapi({ description: "Grand total for the bill", example: 20.28 }),
    paymentMode: z.enum(PaymentMode).openapi({ description: "Payment mode for the bill", example: "CASH" }),
    paidAt: z.date().nullable().openapi({ description: "Timestamp when the bill was paid", example: "2024-01-01T12:00:00Z" }),
    isPaid: z.boolean().openapi({ description: "Indicates if the bill has been paid", example: true }),
    pdfUrl: z.string().nullable().openapi({ description: "URL of the PDF file for the bill", example: "https://example.com/bill.pdf" }),
    invoiceSent: z.boolean().openapi({ description: "Indicates if the invoice has been sent", example: true }),    
});
    
export const CreateBillSchema = z.object({
    orderId: z.string().openapi({ description: "ID of the order associated with this bill", example: "123e4567-e89b-12d3-a456-426655440000" }),
    discountValue: z.union([z.string(), z.number()]).transform((val) => new Prisma.Decimal(val)).openapi({ description: "Discount value applied to the bill", example: 0 }),
    discountType: z.enum(DiscountType).openapi({ description: "Type of discount applied to the bill", example: "PERCENTAGE" }),
    paymentMode: z.enum(PaymentMode).openapi({ description: "Payment mode for the bill", example: "CASH" }),
});

export const BillResponseSchema = billSchema.extend({
    order: OrderResponseSchema,
    pdfUrl: z.string().nullable().openapi({ description: "URL of the PDF file for the bill", example: "https://example.com/bill.pdf" }),
    invoiceSent: z.boolean().openapi({ description: "Indicates if the invoice has been sent", example: true }),
})

export type CreateBill = z.infer<typeof CreateBillSchema>;
export type Bill = z.infer<typeof billSchema>;
export type BillResponse = z.infer<typeof BillResponseSchema>;