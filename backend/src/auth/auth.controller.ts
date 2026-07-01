import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  Query,
} from '@nestjs/common'
import type { Request } from 'express'
import { AuthService } from './auth.service'
import { AuthGuard } from './auth.guard'
import type { Role } from './users.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // POST /auth/login  { email, password }  ->  { accessToken, user }
  @Post('login')
  login(@Body() body: { email?: string; username?: string; password?: string }) {
    const email = body?.email ?? body?.username

    if (!email || !body?.password) {
      throw new UnauthorizedException('email et password requis')
    }
    return this.auth.login(email, body.password)
  }

  // POST /auth/register  { email, password, role? }  ->  { message, email }
  @Post('register')
  register(@Body() body: { email?: string; username?: string; password?: string; role?: Role }) {
    const email = body?.email ?? body?.username

    if (!email || !body?.password) {
      throw new UnauthorizedException('email et password requis')
    }

    const role = body.role === 'admin' ? 'admin' : 'user'
    return this.auth.register(email, body.password, role)
  }

  @Get('verify-email')
  verifyEmail(@Query('token') token?: string) {
    if (!token) {
      throw new UnauthorizedException('token requis')
    }

    return this.auth.verifyEmail(token)
  }

  // GET /auth/me  (route protégée d'exemple) -> l'utilisateur courant.
  // Montre comment lire l'identité une fois le token vérifié par le guard.
  @UseGuards(AuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    return (req as Request & { user?: unknown }).user
  }
}
