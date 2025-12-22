import { StatusCodes } from "http-status-codes";
import { SurplusRepository } from "./surplusRepository";
import type { CreateSurplusMark, SurplusMarkResponse } from "./surplusModel";
import { MenuItemRepository } from "../menuItem/menuItemRepository";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import { AuditLogQueue } from "@/queues/instances/auditlogQueue";
import logger from "@/common/utils/logger";
import { SURPLUS_MARK_AUDIT_ACTIONS } from "@/common/constants/surplusAuditAction";

export class SurplusService {
    private surplusRepository: SurplusRepository;
    private menuItemRepository: MenuItemRepository;
    private auditLogQueue = new AuditLogQueue();

    constructor(
        surplusRepository: SurplusRepository = new SurplusRepository(),
        menuItemRepository: MenuItemRepository = new MenuItemRepository()
    ) {
        this.surplusRepository = surplusRepository;
        this.menuItemRepository = menuItemRepository;
    }

    async createSurplus(data: CreateSurplusMark, markedBy: string): Promise<ServiceResponse<SurplusMarkResponse | null>> {
        try {
            const menuItem = await this.menuItemRepository.findById(data.menuItemId);
            if (!menuItem) {
                return ServiceResponse.failure("Menu item not found for surplus mark", null, StatusCodes.NOT_FOUND);
            }
            const isOverlapping = await this.surplusRepository.findOverlappingMark(
                data.menuItemId, 
                data.surplusAt, 
                data.surplusUntil
            );
            if (isOverlapping) {
                return ServiceResponse.failure(
                    "This item already has a surplus sale scheduled during this time period", 
                    null, 
                    StatusCodes.CONFLICT
                );
            }
            const surplus = await this.surplusRepository.createSurplusMark(data, markedBy);
            await this.auditLogQueue.add("createAuditLog", {
                userId: markedBy,
                action: SURPLUS_MARK_AUDIT_ACTIONS.CREATED,
                resourceType: "SurplusMark",
                resourceId: surplus.id,
                payload: surplus,
                ip: null,
                userAgent: null,
            });
    
            return ServiceResponse.success<SurplusMarkResponse>("Surplus mark created successfully", surplus, StatusCodes.CREATED);
        } catch (error) {
            logger.error("Error creating Surplus Mark:", error);
            return ServiceResponse.failure("Error creating Surplus Mark", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}
export const surplusService = new SurplusService();