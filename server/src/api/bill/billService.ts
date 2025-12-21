import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import { BillRepository } from "./billRepository";
import { DiscountType } from "@/generated/prisma/enums";
import { OrderRepository } from "../order/orderRepository";
import logger from "@/common/utils/logger";
import { BillResponse, CreateBill } from "./billModel";
import { AuditLogQueue } from "@/queues/instances/auditlogQueue";
import { BILL_AUDIT_ACTIONS } from "@/common/constants/billAuditAction";
import { Prisma } from "@/generated/prisma/client";
import { billGenerateService } from "@/common/services/billGenerateService";
export class BillService {
    private TAX_RATE = new Prisma.Decimal(13);
    private SERVICE_CHARGE = new Prisma.Decimal(5);
    private auditLogQueue = new AuditLogQueue();
    private billRepository: BillRepository;
    private orderRepository: OrderRepository;

    constructor(
        billRepository: BillRepository = new BillRepository(),
        orderRepository: OrderRepository = new OrderRepository()
    ) {
        this.billRepository = billRepository;
        this.orderRepository = orderRepository;
    }

    async createBill(data: CreateBill, userId: string): Promise<ServiceResponse<BillResponse | null>> {
        try {
            const order = await this.orderRepository.findOrderById(data.orderId);
            if (!order) {
                return ServiceResponse.failure("Order not found to create Bill", null, StatusCodes.NOT_FOUND);
            }
            let subTotal = order.subTotal;
            let discountAmount = new Prisma.Decimal(0);

            if (data.discountValue.greaterThan(0)) {
                discountAmount = data.discountType === DiscountType.PERCENTAGE
                    ? subTotal.times(data.discountValue.dividedBy(100))
                    : data.discountValue;
            }

            subTotal = subTotal.minus(discountAmount);
            const taxableAmount = subTotal.minus(discountAmount).plus(this.SERVICE_CHARGE);
            const taxAmount = taxableAmount.times(this.TAX_RATE.dividedBy(100));
            const grandTotal = taxableAmount.plus(taxAmount);
        
            const bill = await this.billRepository.create(data, subTotal, discountAmount, taxAmount, grandTotal, this.TAX_RATE, this.SERVICE_CHARGE, userId);

            const { pdfUrl } = await billGenerateService.generateBill(bill);

            const updatedBill = await this.billRepository.updatePdfUrl(bill.id,pdfUrl);    

            if (!updatedBill) {
                return ServiceResponse.failure("Error updating Bill", null, StatusCodes.INTERNAL_SERVER_ERROR);
            }
            await this.auditLogQueue.add("createAuditLog", {
                userId: userId,
                action: BILL_AUDIT_ACTIONS.BILL_CREATED,
                resourceType: "Bill",
                resourceId: updatedBill.id,
                payload: updatedBill,
                ip: null,
                userAgent: null,
            });
            
            return ServiceResponse.success<BillResponse>("Bill created successfully", bill, StatusCodes.CREATED);

        } catch (error) {
            logger.error("Error creating Bill:", error);
            return ServiceResponse.failure("Error creating Bill", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

}

export const billService = new BillService();