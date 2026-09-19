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
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        background: 'linear-gradient(135deg,#0f3443,#34e89e)',
      }}
    >
      <Card
        className="form-card"
        style={{ padding: 32, width: 'min(460px,100%)', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg,#34e89e,#0f3443)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 24,
              margin: '0 auto 12px',
              boxShadow: '0 4px 12px rgba(52,232,158,0.35)',
            }}
          >
            🏪
          </div>
          <span className="section-kicker">Plate40 — Merchant</span>
          <h1 style={{ marginTop: 4, marginBottom: 4 }}>Create Merchant Account</h1>
          <p style={{ color: 'var(--p40-muted)', margin: 0 }}>
            List your restaurant and start receiving orders on Plate40.
          </p>
        </div>

        {/* Info banner */}
        <div
          style={{
            background: 'rgba(52,232,158,0.1)',
            border: '1px solid rgba(52,232,158,0.35)',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: '0.8rem',
            color: '#065f46',
          }}
        >
          🎯 After registration your restaurant will be reviewed and approved by an admin before
          going live.
        </div>

        {/* Form */}
        <form className="form-grid" onSubmit={form.handleSubmit(onSubmit)}>
          <label className="p40-field">
            <span className="p40-label">Owner / Business name</span>
            <Input autoComplete="name" placeholder="e.g. Ramesh Kumar" {...form.register('name')} />
            {form.formState.errors.name && (
              <span className="p40-field-error">{form.formState.errors.name.message}</span>
            )}
          </label>

          <label className="p40-field">
            <span className="p40-label">Phone</span>
            <Input autoComplete="tel" placeholder="+919876543210" {...form.register('phone')} />
            {form.formState.errors.phone && (
              <span className="p40-field-error">{form.formState.errors.phone.message}</span>
            )}
          </label>

          <label className="p40-field">
            <span className="p40-label">Email</span>
            <Input
              type="email"
              autoComplete="email"
              placeholder="owner@restaurant.com"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <span className="p40-field-error">{form.formState.errors.email.message}</span>
            )}
          </label>

          <label className="p40-field">
            <span className="p40-label">Password</span>
            <Input type="password" autoComplete="new-password" {...form.register('password')} />
            {form.formState.errors.password && (
              <span className="p40-field-error">{form.formState.errors.password.message}</span>
            )}
          </label>

          <Button disabled={state.isLoading} type="submit">
            {state.isLoading ? 'Creating account...' : 'Create Merchant Account'}
          </Button>
        </form>

        {/* Footer links */}
        <p
          style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--p40-muted)', margin: 0 }}
        >
          Already have a merchant account?{' '}
          <Link href="/login" style={{ color: 'var(--p40-primary)', fontWeight: 700 }}>
            Sign in
          </Link>
        </p>
        <p
          style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--p40-muted)', margin: 0 }}
        >
          Looking to order food?{' '}
          <a href="http://localhost:3000/register" style={{ color: '#6b7280', fontWeight: 600 }}>
            Customer sign up →
          </a>
        </p>
      </Card>
    </main>
  );
}
