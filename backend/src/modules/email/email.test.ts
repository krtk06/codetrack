import { sendEmail, getDefaultFromEmail } from './email.service.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendInterviewReminderEmail
} from './email.templates.js';

const sendMock = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: sendMock
    }
  }))
}));

describe('email service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    sendMock.mockReset();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('sendEmail', () => {
    it('calls Resend in production when API key is set', async () => {
      process.env.NODE_ENV = 'production';
      process.env.RESEND_API_KEY = 're_test_key';
      process.env.RESEND_FROM_EMAIL = 'CodeTrack <test@codetrack.dev>';
      sendMock.mockResolvedValue({ data: { id: 'msg_123' }, error: null });

      await sendEmail({
        to: 'user@example.com',
        subject: 'Hello',
        html: '<p>Hi</p>',
        text: 'Hi'
      });

      expect(sendMock).toHaveBeenCalledTimes(1);
      expect(sendMock).toHaveBeenCalledWith({
        from: 'CodeTrack <test@codetrack.dev>',
        to: 'user@example.com',
        subject: 'Hello',
        html: '<p>Hi</p>',
        text: 'Hi'
      });
    });

    it('throws when Resend returns an error', async () => {
      process.env.NODE_ENV = 'production';
      process.env.RESEND_API_KEY = 're_test_key';
      sendMock.mockResolvedValue({ data: null, error: { message: 'Invalid API key' } });

      await expect(
        sendEmail({
          to: 'user@example.com',
          subject: 'Hello',
          html: '<p>Hi</p>'
        })
      ).rejects.toThrow('Failed to send email: Invalid API key');
    });

    it('falls back to console logging in development', async () => {
      process.env.NODE_ENV = 'development';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

      await sendEmail({
        to: 'user@example.com',
        subject: 'Hello',
        html: '<p>Hi</p>',
        text: 'Hi'
      });

      expect(sendMock).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('is a no-op in test environment', async () => {
      process.env.NODE_ENV = 'test';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

      await sendEmail({
        to: 'user@example.com',
        subject: 'Hello',
        html: '<p>Hi</p>'
      });

      expect(sendMock).not.toHaveBeenCalled();
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getDefaultFromEmail', () => {
    it('returns env value when set', () => {
      process.env.RESEND_FROM_EMAIL = 'Custom <custom@example.com>';
      expect(getDefaultFromEmail()).toBe('Custom <custom@example.com>');
    });

    it('returns default value when env is not set', () => {
      delete process.env.RESEND_FROM_EMAIL;
      expect(getDefaultFromEmail()).toBe('CodeTrack Pro <noreply@codetrack.dev>');
    });
  });

  describe('email templates', () => {
    let sendEmailSpy: jest.SpyInstance<Promise<void>, [Parameters<typeof sendEmail>[0]]>;

    beforeEach(async () => {
      const emailService = await import('./email.service.js');
      sendEmailSpy = jest.spyOn(emailService, 'sendEmail').mockImplementation(async () => undefined);
    });

    afterEach(() => {
      sendEmailSpy.mockRestore();
    });

    it('sendVerificationEmail includes verification token link', async () => {
      await sendVerificationEmail('user@example.com', 'verify-token-123');
      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
      const message = sendEmailSpy.mock.calls[0][0];
      expect(message.to).toBe('user@example.com');
      expect(message.subject).toBe('Verify your CodeTrack Pro email');
      expect(message.html).toContain('verify-token-123');
      expect(message.text).toContain('verify-token-123');
    });

    it('sendPasswordResetEmail includes reset token link', async () => {
      await sendPasswordResetEmail('user@example.com', 'reset-token-456');
      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
      const message = sendEmailSpy.mock.calls[0][0];
      expect(message.to).toBe('user@example.com');
      expect(message.subject).toBe('Reset your CodeTrack Pro password');
      expect(message.html).toContain('reset-token-456');
      expect(message.text).toContain('reset-token-456');
    });

    it('sendInterviewReminderEmail includes interview details', async () => {
      await sendInterviewReminderEmail('user@example.com', {
        company: 'Google',
        round: 'Technical',
        date: '2026-08-01',
        time: '10:00 AM',
        meetingLink: 'https://meet.google.com/abc'
      });
      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
      const message = sendEmailSpy.mock.calls[0][0];
      expect(message.to).toBe('user@example.com');
      expect(message.subject).toBe('Reminder: Google interview — Technical');
      expect(message.html).toContain('Google');
      expect(message.html).toContain('https://meet.google.com/abc');
    });
  });
});
