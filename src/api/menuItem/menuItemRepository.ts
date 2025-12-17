import { prisma } from "@/common/lib/prisma";
import { MenuItemResponse, CreateMenuItem } from "./menuItemModel";

export class MenuItemRepository {
    async createMenuItem(data: CreateMenuItem, imageUrl: string): Promise<MenuItemResponse> {
        return prisma.menuItem.create({
            data: { ...data, imageUrl },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                categoryId: true,
                isAvailable: true,
                isVeg: true,
                imageUrl: true,
            }
        });
    }
}