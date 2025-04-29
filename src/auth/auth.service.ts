
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
  } from '@nestjs/common';
  import { PrismaService } from 'prisma/prisma.service';
  import { AuthDto } from './dto/auth.dto';
  import * as bcrypt from 'bcrypt';
  import { JwtService } from '@nestjs/jwt';
  import { Request, Response } from 'express';
  import { LoginDto } from './dto/login.dto';
  
  @Injectable()
  export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService) {}
  
    async register(dto: AuthDto) {
      const { name,email, password } = dto;
  
      const userExists = await this.prisma.user.findUnique({
        where: { email },
      });
  
      if (userExists) {
        throw new BadRequestException('Email already exists');
      }
  
      const hashedPassword = await this.hashPassword(password);
  
      await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
  
      return { message: 'User created successfully' };
    }
    async login(dto: LoginDto, req: Request, res: Response) {
      const { email, password } = dto;
  
      const foundUser = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });
  
      if (!foundUser) {
        throw new BadRequestException('Wrong credentials');
      }
  
      const compareSuccess = await this.comparePasswords({
        password,
        hash: foundUser.password ?? '',
      });
  
      if (!compareSuccess) {
        throw new BadRequestException('Wrong credentials');
      }
  
      const token = await this.signToken({
        userId: foundUser.id,
        email: foundUser.email ?? '',
      });
  
      if (!token) {
        throw new ForbiddenException('Could not sign in');
      }
  
      res.cookie('token', token, {
        httpOnly: true,
        secure: true, // Required for HTTPS
        sameSite: 'none', // Required for cross-origin requests
      });
      return res.send({ message: 'Logged in successfully' });
    }
  
    async logout(req: Request, res: Response) {
      res.clearCookie('token');
  
      return res.send({ message: 'Logged out successfully' });
    }
  
    async hashPassword(password: string) {
      const saltOrRounds = 10;
  
      return await bcrypt.hash(password, saltOrRounds);
    }
  
    async comparePasswords(args: { hash: string; password: string }) {
      try {
        const isMatch: boolean = await bcrypt.compare(args.password, args.hash);
        return isMatch;
      } catch  {
        throw new BadRequestException('Error comparing passwords');
      }
    }
  
    async signToken(args: { userId: string; email: string }) {
      const payload = {
        id: args.userId,
        email: args.email,
      };
  
      const token = await this.jwt.signAsync(payload, {
        secret: process.env.JWT_SECRET, // Fetching jwtSecret from environment variable
        expiresIn: process.env.JWT_EXPIRY, // Optional: Set token expiration
      });
  
      return token;
    }
  }