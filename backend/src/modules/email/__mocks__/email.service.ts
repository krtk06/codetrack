import type { EmailMessage } from '../email.service.js';

export let lastEmail: { to: string; subject: string; text: string; html: string } | null = null;

export async function sendEmail(message: EmailMessage): Promise<void> {
  lastEmail = {
    to: message.to,
    subject: message.subject,
    text: message.text ?? '',
    html: message.html
  };
}

export function extractTokenFromLastEmail(): string | null {
  if (!lastEmail) return null;
  const match = lastEmail.text.match(/token=([a-f0-9]+)/);
  return match ? match[1] : null;
}

export function resetLastEmail(): void {
  lastEmail = null;
}
