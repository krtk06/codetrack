export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  if (process.env.NODE_ENV === 'production' && process.env.RESEND_API_KEY) {
    // Resend integration will be wired in Task 0.6
    throw new Error('Production email delivery is not configured yet');
  }

  // eslint-disable-next-line no-console
  console.log('[EMAIL STUB]', {
    to: message.to,
    subject: message.subject,
    text: message.text ?? '(no text)'
  });
}
