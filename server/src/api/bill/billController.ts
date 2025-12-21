import { Request, RequestHandler, Response } from "express";
import { ServiceResponse, handleServiceResponse } from "@/common/utils/serviceResponse";
import { CreateBillSchema, BillResponse } from "./billModel";
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
}

export const billController = new BillController();