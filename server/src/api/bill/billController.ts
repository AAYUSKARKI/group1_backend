import { Request, RequestHandler, Response } from "express";
import { ServiceResponse, handleServiceResponse } from "@/common/utils/serviceResponse";
import { CreateBillSchema, BillResponse } from "./billModel";
import { PaymentMode } from "@/generated/prisma/enums";
import { billService } from "./billService";

class BillController {
    public createBill: RequestHandler = async (req: Request, res: Response) => {
        if (!req.user) {
            return handleServiceResponse(ServiceResponse.failure("You are restricted to create a bill", null, 403), res);
        }
        const data = CreateBillSchema.parse(req.body);
        const serviceResponse = await billService.createBill(data, req.user.id);
        return handleServiceResponse(serviceResponse, res);
    }

    public getBillById: RequestHandler = async (req: Request, res: Response) => {
        const serviceResponse = await billService.getBillById(req.params.id);
        return handleServiceResponse(serviceResponse, res);
    }

    public getAllBills: RequestHandler = async (_req: Request, res: Response) => {
        const serviceResponse = await billService.getAllBills();
        return handleServiceResponse(serviceResponse, res);
    }

    public payBill: RequestHandler = async (req: Request, res: Response) => {
        if (!req.user) {
            return handleServiceResponse(ServiceResponse.failure("You are restricted to pay a bill", null, 403), res);
        }
        const billId = req.params.id;
        const paymentMode = req.body.paymentMode as PaymentMode;
        const serviceResponse = await billService.confirmPayment(billId, paymentMode, req.user.id);
        return handleServiceResponse(serviceResponse, res);
    }
}

export const billController = new BillController();