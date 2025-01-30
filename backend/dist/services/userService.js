"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = require("../lib/prisma");
const apiError_1 = require("../utils/apiError");
class UserService {
    static async updateUser(userId, data) {
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!existingUser) {
            throw new apiError_1.ApiError(404, 'User not found');
        }
        if (data.email && data.email !== existingUser.email) {
            const emailExists = await prisma_1.prisma.user.findUnique({
                where: { email: data.email },
            });
            if (emailExists) {
                throw new apiError_1.ApiError(400, 'Email already in use');
            }
        }
        return await prisma_1.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                isVerified: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=userService.js.map