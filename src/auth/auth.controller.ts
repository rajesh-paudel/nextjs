import { Controller, Body, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import type { Response } from 'express';
import { UsersService } from '../users/users.service.js';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('/login')
  async login(
    @Body() loginDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token } = await this.authService.login(loginDto);

    res.cookie('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000,
    });
    return { message: 'Logged in successfully' };
  }

  @Post('/logout')
  logout(@Res({ passthrough: true }) res: Response) {
    //pasthrough true so we only acess res.cookie and nestjs still serialize the response
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
    });
    return { message: 'logged out successfully' };
  }
}
