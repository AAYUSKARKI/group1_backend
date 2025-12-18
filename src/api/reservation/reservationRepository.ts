import { prisma } from "@/common/lib/prisma";
import { ReservationResponse, CreateReservation } from "./reservationModel";

export class ReservationRepository {
    async createReservation(data: CreateReservation): Promise<ReservationResponse> {
        return prisma.reservation.create({
            data,
            select: {
                id: true,
                tableId: true,
                guestName: true,
                guestPhone: true,
                guests: true,
                status: true,
                reservedAt: true,
                reservedUntil: true,
                durationMin: true
            }
        });
    }
}