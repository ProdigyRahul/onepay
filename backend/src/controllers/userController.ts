import { Request, Response } from 'express';
import { PrismaClient, Prisma, User } from '@prisma/client';

const prisma = new PrismaClient();

type SafeUser = {
  id: string;
  phoneNumber: string;
  name: string | null;
  isVerified: boolean;
};

const sanitizeUser = (user: User): SafeUser => ({
  id: user.id,
  phoneNumber: user.phoneNumber,
  name: user.name,
  isVerified: user.isVerified
});

export const createUser = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, name } = req.body;
    const user = await prisma.user.create({
      data: {
        phoneNumber,
        name
      }
    });
    res.status(201).json(sanitizeUser(user));
  } catch (error) {
    console.error('Create User Error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        res.status(400).json({ error: 'Phone number already exists' });
      } else {
        res.status(400).json({ error: 'Database operation failed' });
      }
    } else {
      res.status(500).json({ error: 'Error creating user' });
    }
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        phoneNumber: true,
        name: true,
        isVerified: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
}; 