'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ROLE_HOME, saveSession } from '@plate40/auth';
import { useLoginMutation } from '@plate40/state';
import { Button, Card, Input } from '@plate40/ui';
import { loginSchema, type LoginValues } from '@plate40/validation';
import { UserRole } from '@plate40/types';
import { useDashboardSession } from '../../components/use-dashboard-session';
import Link from 'next/link';
import { ROUTES } from '@plate40/config';

export default function DashboardLoginPage() {
  const router = useRouter();
  const savedUser = useDashboardSession();
  const [login, state] = useLoginMutation();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  useEffect(() => {
    if (
      savedUser?.role === UserRole.ADMIN ||
      savedUser?.role === UserRole.MERCHANT ||
      savedUser?.role === UserRole.DELIVERY_PARTNER
    ) {
      router.replace(ROLE_HOME[savedUser.role]);
    }
  }, [router, savedUser]);
  async function submit(values: LoginValues) {
    try {
      const session = await login({ ...values, deviceName: 'Plate40 Operations Web' }).unwrap();
      saveSession(session);
      router.replace(ROLE_HOME[session.user.role]);
    } catch {
      toast.error('Unable to sign in with these credentials.');
    }
  }
  if (
    savedUser === undefined ||
    savedUser?.role === UserRole.ADMIN ||
    savedUser?.role === UserRole.MERCHANT ||
    savedUser?.role === UserRole.DELIVERY_PARTNER
  )
    return <main className="p-12 text-center">Restoring your session...</main>;
  return (
    <main className="min-h-screen grid place-items-center p-4 bg-[linear-gradient(135deg,#273249,#4f46e5)]">
      <Card className="grid gap-4 p-7 w-[min(440px,100%)]">
        <span className="text-[#fc8019] text-xs font-extrabold tracking-[0.1em] uppercase block">Plate40 operations</span>
        <h1 className="m-0 text-2xl font-bold">Sign in to the console</h1>
        <p className="m-0 text-slate-500 text-sm">Admin and merchant access is verified by the backend role.</p>
        <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
          <label className="grid gap-1">
            <span className="font-semibold text-sm text-[#06402b]">Email</span>
            <Input type="email" {...form.register('email')} />
          </label>
          <label className="grid gap-1">
            <span className="font-semibold text-sm text-[#06402b]">Password</span>
            <Input type="password" {...form.register('password')} />
          </label>
          <Button disabled={state.isLoading} type="submit">
            {state.isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-4 text-center">
          <Link href={ROUTES.delivery.register} className="text-[#fc8019] font-medium hover:underline">Register as a delivery partner</Link>
        </p>
      </Card>
    </main>
  );
}
