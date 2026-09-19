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
    <main className="delivery-register">
      <Card className="form-card">
        <span className="section-kicker">Plate40 Delivery</span>
        <h1>Become a delivery partner</h1>
        <p>
          Create your driver profile. An admin will verify your documents before you can go online.
        </p>
        <form className="form-grid" onSubmit={submit}>
          <label className="p40-field">
            <span className="p40-label">Full name</span>
            <Input required value={values.name} onChange={(e) => update('name', e.target.value)} />
          </label>
          <label className="p40-field">
            <span className="p40-label">Mobile number</span>
            <Input
              required
              value={values.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </label>
          <label className="p40-field">
            <span className="p40-label">Email</span>
            <Input
              type="email"
              required
              value={values.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </label>
          <label className="p40-field">
            <span className="p40-label">Password</span>
            <Input
              type="password"
              minLength={8}
              required
              value={values.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </label>
          <label className="p40-field">
            <span className="p40-label">Address</span>
            <Input
              required
              value={values.address}
              onChange={(e) => update('address', e.target.value)}
            />
          </label>
          <label className="p40-field">
            <span className="p40-label">Profile photo URL</span>
            <Input
              value={values.profilePhotoUrl}
              onChange={(e) => update('profilePhotoUrl', e.target.value)}
            />
          </label>
          <label className="p40-field">
            <span className="p40-label">Vehicle type</span>
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
          <label className="p40-field">
            <span className="p40-label">Vehicle number</span>
            <Input
              required
              value={values.vehicleNumber}
              onChange={(e) => update('vehicleNumber', e.target.value)}
            />
          </label>
          <label className="p40-field">
            <span className="p40-label">Driving licence number</span>
            <Input
              required
              value={values.documentNumber}
              onChange={(e) => update('documentNumber', e.target.value)}
            />
          </label>
          <label className="p40-field">
            <span className="p40-label">Licence/document URL</span>
            <Input
              value={values.documentUrl}
              onChange={(e) => update('documentUrl', e.target.value)}
            />
          </label>
          <Button disabled={state.isLoading} type="submit">
            {state.isLoading ? 'Submitting...' : 'Register as delivery partner'}
          </Button>
        </form>
        <p>
          Already registered? <Link href="/login">Sign in</Link>
        </p>
      </Card>
    </main>
  );
}
