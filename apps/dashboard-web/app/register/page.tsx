'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { saveSession } from '@plate40/auth';
import { useRegisterMutation } from '@plate40/state';
import { UserRole } from '@plate40/types';
import { Button, Card, Input } from '@plate40/ui';
import { registerSchema, type RegisterValues } from '@plate40/validation';

type RegisterFormInput = Omit<RegisterValues, 'role'> & {
  role?: UserRole.CUSTOMER | UserRole.MERCHANT;
};

export default function MerchantRegisterPage() {
  const router = useRouter();
  const [register, state] = useRegisterMutation();
  const form = useForm<RegisterFormInput, unknown, RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '+91', password: '', role: UserRole.MERCHANT },
  });

  async function onSubmit(values: RegisterValues) {
    try {
      // Always force MERCHANT role on this page
      const session = await register({ ...values, role: UserRole.MERCHANT }).unwrap();
      saveSession(session);
      toast.success('Merchant account created! Welcome to Plate40.');
      router.push('/merchant/dashboard');
    } catch (error) {
      const message =
        typeof error === 'object' && error && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message ?? 'Unable to create account. Please check your details.');
    }
  }

  return (
    <main className="min-h-screen grid place-items-center p-4 bg-[linear-gradient(135deg,#0f3443,#34e89e)]">
      <Card className="grid gap-4 p-8 w-[min(460px,100%)] shadow-2xl">
        {/* Header */}
        <div className="text-center mb-1">
          <div className="w-[52px] h-[52px] rounded-xl bg-[linear-gradient(135deg,#34e89e,#0f3443)] grid place-items-center text-2xl mx-auto mb-3 shadow-[0_4px_12px_rgba(52,232,158,0.35)]">
            🏪
          </div>
          <span className="text-[#fc8019] text-xs font-extrabold tracking-[0.1em] uppercase block">Plate40 — Merchant</span>
          <h1 className="mt-1 mb-1 text-2xl font-bold">Create Merchant Account</h1>
          <p className="text-slate-500 m-0 text-sm">
            List your restaurant and start receiving orders on Plate40.
          </p>
        </div>

        {/* Info banner */}
        <div className="bg-[#34e89e1a] border border-[#34e89e59] rounded-lg py-2.5 px-3.5 text-xs text-emerald-800">
          🎯 After registration your restaurant will be reviewed and approved by an admin before
          going live.
        </div>

        {/* Form */}
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <label className="grid gap-1">
            <span className="font-semibold text-sm text-[#06402b]">Owner / Business name</span>
            <Input autoComplete="name" placeholder="e.g. Ramesh Kumar" {...form.register('name')} />
            {form.formState.errors.name && (
              <span className="text-red-500 text-xs">{form.formState.errors.name.message}</span>
            )}
          </label>

          <label className="grid gap-1">
            <span className="font-semibold text-sm text-[#06402b]">Phone</span>
            <Input autoComplete="tel" placeholder="+919876543210" {...form.register('phone')} />
            {form.formState.errors.phone && (
              <span className="text-red-500 text-xs">{form.formState.errors.phone.message}</span>
            )}
          </label>

          <label className="grid gap-1">
            <span className="font-semibold text-sm text-[#06402b]">Email</span>
            <Input
              type="email"
              autoComplete="email"
              placeholder="owner@restaurant.com"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <span className="text-red-500 text-xs">{form.formState.errors.email.message}</span>
            )}
          </label>

          <label className="grid gap-1">
            <span className="font-semibold text-sm text-[#06402b]">Password</span>
            <Input type="password" autoComplete="new-password" {...form.register('password')} />
            {form.formState.errors.password && (
              <span className="text-red-500 text-xs">{form.formState.errors.password.message}</span>
            )}
          </label>

          <Button disabled={state.isLoading} type="submit">
            {state.isLoading ? 'Creating account...' : 'Create Merchant Account'}
          </Button>
        </form>

        {/* Footer links */}
        <p className="text-center text-sm text-slate-500 m-0">
          Already have a merchant account?{' '}
          <Link href="/login" className="text-[#fc8019] font-bold hover:underline">
            Sign in
          </Link>
        </p>
        <p className="text-center text-xs text-slate-500 m-0">
          Looking to order food?{' '}
          <a href="http://localhost:3000/register" className="text-slate-500 font-semibold hover:underline">
            Customer sign up →
          </a>
        </p>
      </Card>
    </main>
  );
}
