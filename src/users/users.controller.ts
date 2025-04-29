import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Protected route to verify and fetch the authenticated user's details
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getAuthenticatedUser(@Req() req: Request) {
    return this.usersService.getAuthenticatedUser(req);
  }
}