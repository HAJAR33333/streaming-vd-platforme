import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { Resend } from 'resend'

@Injectable()
export class EmailService {
  assertConfigured() {
    if (!process.env.RESEND_API_KEY) {
      throw new ServiceUnavailableException(
        'Envoi email non configuré: renseignez RESEND_API_KEY et EMAIL_FROM',
      )
    }
  }

  async sendVerificationEmail(email: string, verificationUrl: string) {
    this.assertConfigured()

    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'StudioFlix <onboarding@resend.dev>',
      to: email,
      subject: 'Confirmez votre compte StudioFlix',
      text: [
        'Bienvenue sur StudioFlix.',
        '',
        'Cliquez sur ce lien pour confirmer votre email :',
        verificationUrl,
        '',
        "Si vous n'etes pas a l'origine de cette inscription, ignorez cet email.",
      ].join('\n'),
      html: `
        <p>Bienvenue sur <strong>StudioFlix</strong>.</p>
        <p>Cliquez sur ce lien pour confirmer votre email :</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>Si vous n'etes pas a l'origine de cette inscription, ignorez cet email.</p>
      `,
    })
  }
}
