import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common'
import * as argon2 from 'argon2'

export type Role = 'admin' | 'user'

export interface User {
  id: number
  email: string
  role: Role
  passwordHash: string
  emailVerified: boolean
  emailVerificationToken?: string
}

// ⚠️ Comptes de DÉMO. Les mots de passe en clair ne sont là QUE pour le hackathon :
//    en vrai, on stocke uniquement les hash (pas de mot de passe en clair nulle part).
//    Ceci est un point de départ — ajoutez une vraie inscription / base de données si
//    vous le souhaitez (ce n'est pas l'objet de la note).
const SEED: Array<{ email: string; password: string; role: Role }> = [
  { email: 'alice@studioflix.local', password: 'password', role: 'admin' },
]

@Injectable()
export class UsersService implements OnModuleInit {
  private users: User[] = []

  // Au démarrage, on hash les mots de passe de démo avec Argon2 (comme le produit réel).
  async onModuleInit(): Promise<void> {
    this.users = await Promise.all(
      SEED.map(async (u, i) => ({
        id: i + 1,
        email: u.email,
        role: u.role,
        passwordHash: await argon2.hash(u.password),
        emailVerified: true,
      })),
    )
  }

  findByEmail(email: string): Promise<User | undefined> {
    const normalizedEmail = this.normalizeEmail(email)
    return Promise.resolve(this.users.find((u) => u.email === normalizedEmail))
  }

  async createUser(
    email: string,
    password: string,
    role: Role = 'user',
    verificationToken: string,
  ): Promise<User> {
    const normalizedEmail = this.normalizeEmail(email)
    const existingUser = await this.findByEmail(normalizedEmail)

    if (existingUser) {
      throw new ConflictException('Utilisateur déjà existant')
    }

    const user: User = {
      id: this.users.length + 1,
      email: normalizedEmail,
      role,
      passwordHash: await argon2.hash(password),
      emailVerified: false,
      emailVerificationToken: verificationToken,
    }

    this.users.push(user)
    return user
  }

  verifyEmail(token: string): Promise<User | undefined> {
    const user = this.users.find((u) => u.emailVerificationToken === token)

    if (!user) {
      return Promise.resolve(undefined)
    }

    user.emailVerified = true
    user.emailVerificationToken = undefined
    return Promise.resolve(user)
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase()
  }
}
