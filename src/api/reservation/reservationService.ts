import { StatusCodes } from "http-status-codes";
import type { ReservationResponse, CreateReservation } from "./reservationModel";
import { ReservationRepository } from "./reservationRepository";
import { TableRepository } from "../table/tableRepository";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import logger from "@/common/utils/logger";

export class ReservationService {
    private reservationRepository: ReservationRepository;
    private tableRepository: TableRepository;

    constructor(
        reservationRepository: ReservationRepository = new ReservationRepository(),
        tableRepository: TableRepository = new TableRepository()
    ) {
        this.reservationRepository = reservationRepository;
        this.tableRepository = tableRepository;
    }

    async createReservation(data: CreateReservation): Promise<ServiceResponse<ReservationResponse | null>> {
        try {
            const table = await this.tableRepository.findById(data.tableId);
            if (!table) {
                return ServiceResponse.failure("Table not found", null, StatusCodes.NOT_FOUND);
            }
            const reservation = await this.reservationRepository.createReservation(data);
            return ServiceResponse.success<ReservationResponse>("Reservation created successfully", reservation, StatusCodes.CREATED);
        } catch (error) {
            logger.error("Error creating Reservation:", error);
            return ServiceResponse.failure("Error creating Reservation", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

export const reservationService = new ReservationService();