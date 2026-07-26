import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../lib/api';
import { resetPasswordSchema } from '../features/auth/authSchemas';
import AuthLayout from '../components/AuthLayout';

type ResetPasswordForm = {
  password: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordForm>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }
    try {
      await api.post('/auth/reset-password', { token, password: data.password });
      setSubmitted(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch {
      toast.error('Unable to reset password. Please try again.');
    }
  };

  if (submitted) {
    return (
      <AuthLayout
        title="Password reset"
        subtitle="Your password has been updated."
        footer={
          <Link to="/login" className="text-[var(--primary)] hover:underline">
            Sign in with your new password
          </Link>
        }
      >
        <div className="rounded-lg bg-[var(--muted)] p-4 text-center text-[var(--muted-foreground)]">
          Redirecting you to sign in...
        </div>
      </AuthLayout>
    );
  }

  if (!token) {
    return (
      <AuthLayout
        title="Invalid link"
        subtitle="This password reset link is missing or expired."
        footer={
          <Link to="/forgot-password" className="text-[var(--primary)] hover:underline">
            Request a new link
          </Link>
        }
      >
        <div className="rounded-lg bg-[var(--muted)] p-4 text-center text-[var(--muted-foreground)]">
          Please request a new password reset.
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Choose a new password for your account"
      footer={
        <Link to="/login" className="text-[var(--primary)] hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--muted-foreground)]">
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className="mt-1 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--muted-foreground)]">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            {...register('confirmPassword')}
            className="mt-1 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-[var(--destructive)]">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-[var(--primary-foreground)] disabled:opacity-50"
        >
          {isSubmitting ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
    </AuthLayout>
  );
}
