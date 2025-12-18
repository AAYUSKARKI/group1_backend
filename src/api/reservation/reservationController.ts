import { Request, RequestHandler, Response } from "express";
import { ServiceResponse, handleServiceResponse } from "@/common/utils/serviceResponse";
import { reservationService } from "./reservationService";
import { CreateReservationSchema, ReservationResponse } from "./reservationModel";

class ReservationController {
    public createReservation: RequestHandler = async (req: Request, res: Response) => {
        const data = CreateReservationSchema.parse(req.body);
        const serviceResponse: ServiceResponse<ReservationResponse | null> = await reservationService.createReservation(data);
        return handleServiceResponse(serviceResponse, res);
    } 
}

export const reservationController = new ReservationController();