import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/apiError';

export class UserService {
  /**
   * Update user information
   * @param userId - The ID of the user to update
   * @param data - The data to update
   * @returns Updated user object
   */
  static async updateUser(userId: string, data: { email?: string }) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new ApiError(404, 'User not found');
    }

    // Check if email is being updated and is unique
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new ApiError(400, 'Email already in use');
      }
    }

    return await prisma.user.update({
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
