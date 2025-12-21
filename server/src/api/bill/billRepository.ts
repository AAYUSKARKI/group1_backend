import { Prisma } from "@/generated/prisma/client";
import { BillResponse, CreateBill } from "./billModel";
import { prisma } from "@/common/lib/prisma";

export class BillRepository {
    async create(data: CreateBill, subTotal: Prisma.Decimal, discountAmount: Prisma.Decimal, taxAmount: Prisma.Decimal, grandTotal: Prisma.Decimal, TAX_RATE: Prisma.Decimal, serviceCharge: Prisma.Decimal, userId: string): Promise<BillResponse> {
        const bill = await prisma.bill.create({
            data: {
                ...data,
                invoiceSent: false,
                generatedBy: userId,
                subTotal: subTotal,
                discountValue: discountAmount,
                taxAmount: taxAmount,
                grandTotal: grandTotal,
                taxPct: TAX_RATE,
                serviceCharge
            },
            include: {
                order: {
                    include: {
                        items: {
                            include: {
                                menuItem: true
                            }
                        }
                    }
                }
            }
        });
        return bill;
    }

    async updatePdfUrl(billId: string, pdfUrl: string): Promise<BillResponse> {
        const bill = await prisma.bill.update({
            where: {
                id: billId
            },
            data: {
                pdfUrl: pdfUrl
            },
            include: {
                order: {
                    include: {
                        items: {
                            include: {
                                menuItem: true
                            }
                        }
                    }
                }
            }
        });
        return bill;
    }
}