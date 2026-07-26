import { Resend } from 'resend';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export function getDefaultFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL ?? 'CodeTrack Pro <noreply@codetrack.dev>';
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  if (process.env.NODE_ENV === 'production' && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: getDefaultFromEmail(),
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text
    });

    if (result.error) {
      throw new Error(`Failed to send email: ${result.error.message}`);
    }

    return;
  }

  if (process.env.NODE_ENV === 'test') {
    return;
  }

  // eslint-disable-next-line no-console
  console.log('[EMAIL STUB]', {
    to: message.to,
    subject: message.subject,
    text: message.text ?? '(no text)'
  });
}
