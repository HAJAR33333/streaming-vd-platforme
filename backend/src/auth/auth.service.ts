import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import { randomUUID } from 'crypto'
import { EmailService } from './email.service'
import { Role, User, UsersService } from './users.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly email: EmailService,
  ) {}

  // Vérifie les identifiants puis émet un JWT court qui identifiera l'utilisateur
  // sur toutes les requêtes suivantes.
  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email)
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      throw new UnauthorizedException('Identifiants invalides')
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Email non confirmé')
    }

    return this.createSession(user)
  }

  async register(email: string, password: string, role: Role = 'user') {
    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Email invalide')
    }

    if (password.length < 6) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 6 caractères')
    }

    this.email.assertConfigured()

    const verificationToken = randomUUID()
    const user = await this.users.createUser(email, password, role, verificationToken)
    const verificationUrl = `http://localhost:${process.env.PORT ?? 3001}/auth/verify-email?token=${verificationToken}`

    await this.email.sendVerificationEmail(user.email, verificationUrl)

    return {
      message: 'Compte créé. Vérifiez votre email pour activer la connexion.',
      email: user.email,
    }
  }

  async verifyEmail(token: string) {
    const user = await this.users.verifyEmail(token)

    if (!user) {
      throw new BadRequestException('Lien de confirmation invalide')
    }

    return 'Email confirmé. Vous pouvez maintenant vous connecter à StudioFlix.'
  }

  private async createSession(user: User) {
    const payload = { sub: user.id, email: user.email, username: user.email, role: user.role }
    const accessToken = await this.jwt.signAsync(payload)

    return {
      accessToken,
      user: { id: user.id, email: user.email, username: user.email, role: user.role },
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  }
}
