import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { profileSchema, type ProfileForm } from '../features/users/usersSchemas';
import { getCurrentUser, updateCurrentUser } from '../features/users/usersApi';

function normalizeYear(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  return String(value);
}

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { user } = await getCurrentUser();
        if (cancelled) return;
        reset({
          name: user.name,
          college: user.college ?? '',
          graduationYear: normalizeYear(user.graduationYear),
          targetCompany: user.targetCompany ?? '',
          targetRole: user.targetRole ?? '',
          leetcodeUsername: user.leetcodeUsername ?? '',
          githubUsername: user.githubUsername ?? ''
        });
      } catch {
        toast.error('Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [reset]);

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        graduationYear: data.graduationYear ? parseInt(data.graduationYear, 10) : undefined
      };
      const { user } = await updateCurrentUser(payload);
      reset({
        name: user.name,
        college: user.college ?? '',
        graduationYear: normalizeYear(user.graduationYear),
        targetCompany: user.targetCompany ?? '',
        targetRole: user.targetRole ?? '',
        leetcodeUsername: user.leetcodeUsername ?? '',
        githubUsername: user.githubUsername ?? ''
      });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]" />
      </div>
    );
  }

  const fields: { id: keyof ProfileForm; label: string; type?: string }[] = [
    { id: 'name', label: 'Name' },
    { id: 'college', label: 'College' },
    { id: 'graduationYear', label: 'Graduation Year', type: 'number' },
    { id: 'targetCompany', label: 'Target Company' },
    { id: 'targetRole', label: 'Target Role' },
    { id: 'leetcodeUsername', label: 'LeetCode Username' },
    { id: 'githubUsername', label: 'GitHub Username' }
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-[var(--foreground)]">Profile Settings</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        {fields.map(({ id, label, type = 'text' }) => (
          <div key={id}>
            <label htmlFor={id} className="block text-sm font-medium text-[var(--muted-foreground)]">
              {label}
            </label>
            <input
              id={id}
              type={type}
              {...register(id)}
              className="mt-1 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
            />
            {errors[id] && <p className="mt-1 text-sm text-[var(--destructive)]">{errors[id]?.message}</p>}
          </div>
        ))}

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-[var(--primary-foreground)] disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
