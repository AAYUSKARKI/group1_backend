import { Request, RequestHandler, Response } from "express";
import { ServiceResponse, handleServiceResponse } from "@/common/utils/serviceResponse";
import { surplusService } from "./surplusService";
import { CreateSurplusMarkSchema, SurplusMarkResponse } from "./surplusModel";
class SurplusController {
    public createSurplusMark: RequestHandler = async (req: Request, res: Response) => {
        if(!req.user) {
            return handleServiceResponse(ServiceResponse.failure("You are restricted to create a surplus mark", null, 403), res);
        }
        const data = CreateSurplusMarkSchema.parse(req.body);
        const serviceResponse: ServiceResponse<SurplusMarkResponse | null> = await surplusService.createSurplus(data, req.user.id);
        return handleServiceResponse(serviceResponse, res);
    }
}

export const surplusController = new SurplusController();