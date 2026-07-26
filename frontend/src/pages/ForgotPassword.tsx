import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../lib/api';
import { forgotPasswordSchema } from '../features/auth/authSchemas';
import AuthLayout from '../components/AuthLayout';

type ForgotPasswordForm = {
  email: string;
};

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordForm>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      await api.post('/auth/forgot-password', data);
      setSubmitted(true);
    } catch {
      toast.error('Unable to send reset email. Please try again.');
    }
  };

  if (submitted) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="If an account exists, we've sent a reset link."
        footer={
          <Link to="/login" className="text-[var(--primary)] hover:underline">
            Back to sign in
          </Link>
        }
      >
        <div className="rounded-lg bg-[var(--muted)] p-4 text-center text-[var(--muted-foreground)]">
          Check your inbox for the reset instructions.
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your email and we'll send you a reset link"
      footer={
        <Link to="/login" className="text-[var(--primary)] hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--muted-foreground)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="mt-1 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          />
          {errors.email && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-[var(--primary-foreground)] disabled:opacity-50"
        >
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
    </AuthLayout>
  );
}
