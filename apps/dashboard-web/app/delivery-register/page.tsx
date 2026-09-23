'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { saveSession } from '@plate40/auth';
import { ROUTES } from '@plate40/config';
import { useRegisterDeliveryPartnerMutation } from '@plate40/state';
import { UserRole, VehicleType } from '@plate40/types';
import { Button, Card, Input } from '@plate40/ui';

const initial = {
  name: '',
  phone: '+91',
  email: '',
  password: '',
  profilePhotoUrl: '',
  address: '',
  vehicleType: VehicleType.MOTORCYCLE,
  vehicleNumber: '',
  documentType: 'DRIVING_LICENCE',
  documentNumber: '',
  documentUrl: '',
};

export default function DeliveryRegisterPage() {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [register, state] = useRegisterDeliveryPartnerMutation();
  const update = (key: keyof typeof initial, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const session = await register({ ...values, role: UserRole.DELIVERY_PARTNER }).unwrap();
      saveSession(session);
      toast.success('Registration submitted for approval');
      router.replace(ROUTES.delivery.dashboard);
    } catch (error) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ?? 'Registration failed',
      );
    }
  }
  return (
    <main className="min-h-screen grid place-items-center p-6 bg-[linear-gradient(145deg,#0f172a,#1d4ed8)]">
      <Card className="grid gap-4 p-7 w-[min(760px,100%)] shadow-2xl bg-white">
        <span className="text-[#fc8019] text-xs font-extrabold tracking-[0.1em] uppercase block">Plate40 Delivery</span>
        <h1 className="m-0 text-2xl font-bold">Become a delivery partner</h1>
        <p className="m-0 text-slate-500 text-sm">
          Create your driver profile. An admin will verify your documents before you can go online.
        </p>
        <form className="grid gap-4 mt-2" onSubmit={submit}>
          <label className="grid gap-1">
            <span className="font-semibold text-sm text-[#06402b]">Full name</span>
            <Input required value={values.name} onChange={(e) => update('name', e.target.value)} />
          </label>
          <label className="grid gap-1">
            <span className="font-semibold text-sm text-[#06402b]">Mobile number</span>
            <Input
              required
              value={values.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className="font-semibold text-sm text-[#06402b]">Email</span>
            <Input
              type="email"
              required
              value={values.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className="font-semibold text-sm text-[#06402b]">Password</span>
            <Input
              type="password"
              minLength={8}
              required
              value={values.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className="font-semibold text-sm text-[#06402b]">Address</span>
            <Input
              required
              value={values.address}
              onChange={(e) => update('address', e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className="font-semibold text-sm text-[#06402b]">Profile photo URL</span>
            <Input
              value={values.profilePhotoUrl}
              onChange={(e) => update('profilePhotoUrl', e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className="font-semibold text-sm text-[#06402b]">Vehicle type</span>
            <select
              className="p40-input"
              value={values.vehicleType}
              onChange={(e) => update('vehicleType', e.target.value)}
            >
              {Object.values(VehicleType).map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="font-semibold text-sm text-[#06402b]">Vehicle number</span>
            <Input
              required
              value={values.vehicleNumber}
              onChange={(e) => update('vehicleNumber', e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className="font-semibold text-sm text-[#06402b]">Driving licence number</span>
            <Input
              required
              value={values.documentNumber}
              onChange={(e) => update('documentNumber', e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className="font-semibold text-sm text-[#06402b]">Licence/document URL</span>
            <Input
              value={values.documentUrl}
              onChange={(e) => update('documentUrl', e.target.value)}
            />
          </label>
          <Button disabled={state.isLoading} type="submit">
            {state.isLoading ? 'Submitting...' : 'Register as delivery partner'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already registered? <Link href="/login" className="text-[#fc8019] font-bold hover:underline">Sign in</Link>
        </p>
      </Card>
    </main>
  );
}
