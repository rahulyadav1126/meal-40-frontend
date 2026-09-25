'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { clearSession, saveSession } from '@plate40/auth';
import { ROUTES } from '@plate40/config';
import { useLoginMutation, useRegisterMutation } from '@plate40/state';
import { UserRole } from '@plate40/types';
import { Button, Card, Input } from '@plate40/ui';
import { loginSchema, registerSchema, type RegisterValues } from '@plate40/validation';

export function AuthForm({ mode, isModal, onSuccess }: { mode: 'login' | 'register'; isModal?: boolean; onSuccess?: () => void }) {
  const router = useRouter();
  const [login, loginState] = useLoginMutation();
  const [registerUser, registerState] = useRegisterMutation();
  const isRegister = mode === 'register';
  const resolver = zodResolver(
    isRegister ? registerSchema : loginSchema,
  ) as unknown as Resolver<RegisterValues>;
  const form = useForm<RegisterValues>({
    resolver,
    defaultValues: { name: '', email: '', phone: '+91', password: '', role: UserRole.CUSTOMER },
  });
  const state = isRegister ? registerState : loginState;
  async function onSubmit(values: RegisterValues) {
    try {
      const session = isRegister
        ? await registerUser(values).unwrap()
        : await login({
          email: values.email,
          password: values.password,
          deviceName: 'Plate40 Customer Web',
        }).unwrap();
      if (session.user.role !== UserRole.CUSTOMER) {
        clearSession();
        toast.error(
          'This account belongs to the merchant or admin portal. Sign in with a customer account.',
        );
        return;
      }
      saveSession(session);
      toast.success(isRegister ? 'Account created' : 'Welcome back');
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(ROUTES.customer.home);
      }
    } catch (error) {
      const message =
        typeof error === 'object' && error && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message ?? 'Unable to continue. Please check your details.');
    }
  }
  const content = (
    <Card className={isModal ? "w-full border-none shadow-none grid gap-4 p-2 sm:p-4" : "w-[min(480px,calc(100%-2rem))] my-16 mx-auto p-6 md:p-8 grid gap-4"}>
      <div>
        <span className="text-p40-primary text-[0.72rem] font-[800] tracking-[0.08em] uppercase">Plate40 account</span>
        <h1 className="m-0">{isRegister ? 'Create your account' : 'Welcome back'}</h1>
        <p className="m-0 text-p40-muted mt-2">
          {isRegister
            ? 'Join Plate40 for budget-friendly neighborhood meals.'
            : 'Sign in to order, track, and manage your meals.'}
        </p>
      </div>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        {isRegister ? (
          <>
            <label className="p40-field">
              <span className="p40-label">Full name</span>
              <Input autoComplete="name" {...form.register('name')} />
              {form.formState.errors.name ? (
                <span className="p40-field-error">{form.formState.errors.name.message}</span>
              ) : null}
            </label>
            <label className="p40-field">
              <span className="p40-label">Phone</span>
              <Input autoComplete="tel" {...form.register('phone')} />
              {form.formState.errors.phone ? (
                <span className="p40-field-error">{form.formState.errors.phone.message}</span>
              ) : null}
            </label>
          </>
        ) : null}
        <label className="p40-field">
          <span className="p40-label">Email</span>
          <Input type="email" autoComplete="email" {...form.register('email')} />
          {form.formState.errors.email ? (
            <span className="p40-field-error">{form.formState.errors.email.message}</span>
          ) : null}
        </label>
        <label className="p40-field">
          <span className="p40-label">Password</span>
          <Input
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            {...form.register('password')}
          />
          {form.formState.errors.password ? (
            <span className="p40-field-error">{form.formState.errors.password.message}</span>
          ) : null}
        </label>
        <Button disabled={state.isLoading} type="submit" className="w-full">
          {state.isLoading ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
        </Button>
      </form>
      <p className="m-0 text-p40-muted">
        {isRegister ? 'Already have an account?' : 'New to Plate40?'}{' '}
        <Link
          className="text-p40-primary font-bold hover:underline"
          href={isRegister ? ROUTES.customer.login : ROUTES.customer.register}
        >
          {isRegister ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </Card>
  );

  if (isModal) return content;

  return <main className="py-8 pb-16 min-h-[70vh]">{content}</main>;
}
<div className="bg-gradient-to-br from-[#fcd34d] via-[#f9dcc4] to-[#ffedd5] p-12 lg:px-20 lg:py-16 w-full lg:w-5/12 flex flex-col justify-center relative lg:overflow-hidden">

  {/* Subtle Parallax Background Image */}
  <div
    ref={bgRef}
    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-color-burn opacity-15"
  />

  <div ref={leftContentRef} className="relative z-10 flex flex-col h-full justify-center">
    <div className="mb-auto flex flex-col items-start gap-8">
      <Link href={ROUTES.customer.home} className="inline-flex items-center text-[#06402b] hover:text-[#fc8019] text-sm font-bold transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Link>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Plate40" className="h-[40px] md:h-[58px] w-auto object-contain" />
    </div>

    <div className="my-auto">
      <h2 className="text-5xl lg:text-7xl font-black text-[#432c1a] leading-[1.1] m-0 tracking-tight">Good food.</h2>
      <h2 className="text-5xl lg:text-7xl font-black text-[#f97316] leading-[1.1] m-0 mb-8 tracking-tight">Good account.</h2>

      <p className="text-[#5c4533] font-medium leading-relaxed mb-10 max-w-md text-lg">
        Create one secure account for a smoother Plate40 experience and stay connected with what is happening on the platform.
      </p>

      <ul className="grid gap-5 text-[#432c1a] font-bold list-none p-0 m-0">
        <li className="flex items-center gap-4">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] block"></span> Secure account access
        </li>
        <li className="flex items-center gap-4">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] block"></span> Email verification
        </li>
        <li className="flex items-center gap-4">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] block"></span> Built for Plate40
        </li>
      </ul>
    </div>
  </div>
</div>

{/* Right Side (Form) */ }
<div ref={scrollContainerRef} className="p-12 lg:p-20 w-full lg:w-7/12 flex flex-col justify-center bg-white lg:overflow-y-auto relative">
  {formContent}
</div>
    </div >
  );

if (isModal) {
  return (
    <div className="p-6 bg-white w-full rounded-2xl max-w-md mx-auto">
      {formContent}
    </div>
  );
}

return (
  <div className="w-full flex-1 bg-white lg:h-screen lg:overflow-hidden">
    {splitLayout}
  </div>
);
}
