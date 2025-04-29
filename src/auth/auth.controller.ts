import { Body, Controller, Get, Post, Request, Response } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  signup(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async signin(@Request() req, @Response() res, @Body() dto: LoginDto) {
    return this.authService.login(dto, req, res);
  }

  @Get('logout')
  signout(@Request() req, @Response() res) {
    return this.authService.logout(req, res);
  }
}