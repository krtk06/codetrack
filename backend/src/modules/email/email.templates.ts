import { sendEmail } from './email.service.js';

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify your CodeTrack Pro email',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Verify your email</h2>
        <p>Thanks for signing up for CodeTrack Pro. Click the button below to verify your email address.</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">Verify email</a>
        <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">If you did not create an account, you can ignore this email.</p>
      </div>
    `,
    text: `Verify your email: ${verificationUrl}`
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset your CodeTrack Pro password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>We received a request to reset your password. Click the button below to choose a new one.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">Reset password</a>
        <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">This link expires in 1 hour. If you did not request a reset, you can ignore this email.</p>
      </div>
    `,
    text: `Reset your password: ${resetUrl}`
  });
}

export async function sendInterviewReminderEmail(
  email: string,
  details: { company: string; round: string; date: string; time: string; meetingLink?: string }
): Promise<void> {
  const meetingSection = details.meetingLink
    ? `<p><strong>Meeting link:</strong> <a href="${details.meetingLink}">${details.meetingLink}</a></p>`
    : '';

  await sendEmail({
    to: email,
    subject: `Reminder: ${details.company} interview — ${details.round}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Upcoming interview</h2>
        <p><strong>Company:</strong> ${details.company}</p>
        <p><strong>Round:</strong> ${details.round}</p>
        <p><strong>Date:</strong> ${details.date}</p>
        <p><strong>Time:</strong> ${details.time}</p>
        ${meetingSection}
        <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">Good luck from the CodeTrack Pro team.</p>
      </div>
    `,
    text: `Upcoming interview: ${details.company} - ${details.round} on ${details.date} at ${details.time}${
      details.meetingLink ? ` (${details.meetingLink})` : ''
    }`
  });
}
