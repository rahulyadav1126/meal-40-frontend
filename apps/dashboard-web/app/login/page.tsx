'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ROLE_HOME, saveSession } from '@plate40/auth';
import { useLoginMutation } from '@plate40/state';
import { Button, Card, Input } from '@plate40/ui';
import { loginSchema, type LoginValues } from '@plate40/validation';

export default function DashboardLoginPage() {
  const router = useRouter();
  const [login, state] = useLoginMutation();
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });
  async function submit(values: LoginValues) { try { const session = await login({ ...values, deviceName: 'Plate40 Operations Web' }).unwrap(); saveSession(session); router.push(ROLE_HOME[session.user.role]); } catch { toast.error('Unable to sign in with these credentials.'); } }
  return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16, background: 'linear-gradient(135deg,#273249,#4f46e5)' }}><Card className="form-card" style={{ padding: 28, width: 'min(440px,100%)' }}><span className="section-kicker">Plate40 operations</span><h1>Sign in to the console</h1><p>Admin and merchant access is verified by the backend role.</p><form className="form-grid" onSubmit={form.handleSubmit(submit)}><label className="p40-field"><span className="p40-label">Email</span><Input type="email" {...form.register('email')} /></label><label className="p40-field"><span className="p40-label">Password</span><Input type="password" {...form.register('password')} /></label><Button disabled={state.isLoading} type="submit">{state.isLoading ? 'Signing in...' : 'Sign in'}</Button></form></Card></main>;
}
