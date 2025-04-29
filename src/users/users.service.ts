import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Fetch the authenticated user's details
  async getAuthenticatedUser(req: Request) {
    const decodedUserInfo = req.user as { id: string; email: string };

    const foundUser = await this.prisma.user.findUnique({
      where: { id: decodedUserInfo.id },
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    return { id: foundUser.id, email: foundUser.email, name: foundUser.name };
  }
}