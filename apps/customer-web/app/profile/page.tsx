'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useSyncExternalStore, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  Mail,
  MapPin,
  PackageOpen,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { clearSession, SESSION_CHANGED_EVENT, updateStoredUser } from '@plate40/auth';
import { ROUTES, STORAGE_KEYS } from '@plate40/config';
import { baseApi, useAppDispatch, useProfileQuery, useUpdateProfileMutation } from '@plate40/state';
import { UserRole, type User } from '@plate40/types';
import { Button, Card, Input, PageHeader } from '@plate40/ui';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(SESSION_CHANGED_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(SESSION_CHANGED_EVENT, callback);
  };
}

function errorMessage(error: unknown) {
  if (typeof error !== 'object' || error === null) return 'Could not update your profile.';
  const candidate = error as { data?: { message?: string }; message?: string };
  return candidate.data?.message ?? candidate.message ?? 'Could not update your profile.';
}

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const rawUser = useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(STORAGE_KEYS.user),
    () => null,
  );
  const user = useMemo(() => {
    if (!rawUser) return null;
    try {
      const stored = JSON.parse(rawUser) as User;
      return stored.role === UserRole.CUSTOMER ? stored : null;
    } catch {
      return null;
    }
  }, [rawUser]);
  const { data: profile } = useProfileQuery(undefined, { skip: !user });
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (profile && JSON.stringify(profile) !== rawUser) updateStoredUser(profile);
  }, [profile, rawUser]);

  const logout = () => {
    clearSession();
    dispatch(baseApi.util.resetApiState());
    router.replace(ROUTES.customer.home);
  };

  const cancelEditing = () => {
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
    setPhone(user?.phone ?? '');
    setEditing(false);
  };

  const toggleEditor = () => {
    if (editing) {
      setEditing(false);
      return;
    }
    const current = profile ?? user;
    setName(current?.name ?? '');
    setEmail(current?.email ?? '');
    setPhone(current?.phone ?? '');
    setEditing(true);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const updated = await updateProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      }).unwrap();
      updateStoredUser(updated);
      setEditing(false);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  if (!user)
    return (
      <main className="page-shell p40-container">
        <PageHeader
          title="Your Plate40 account"
          description="Sign in to manage your profile, orders, and delivery addresses."
        />
        <Card className="profile-signin">
          <UserRound size={32} />
          <h2>You are not signed in</h2>
          <p>Create an account or sign in to start ordering.</p>
          <div className="profile-signin__actions">
            <Link className="p40-button p40-button--primary" href={ROUTES.customer.login}>
              Sign in
            </Link>
            <Link className="p40-button p40-button--secondary" href={ROUTES.customer.register}>
              Create account
            </Link>
          </div>
        </Card>
      </main>
    );

  return (
    <main className="page-shell p40-container">
      <PageHeader
        title="Your Plate40 account"
        description="Manage your profile, delivery details, and order preferences."
      />
      <Card className="profile-account">
        <span className="profile-account__avatar">{user.name.slice(0, 1).toUpperCase()}</span>
        <div className="profile-account__details">
          <span className="section-kicker">CUSTOMER PROFILE</span>
          <h2>{user.name}</h2>
          <p>
            <Mail size={16} />
            {user.email}
          </p>
          <p>
            <Phone size={16} />
            {user.phone}
          </p>
        </div>
        <div className="profile-account__actions">
          <Button variant="secondary" onClick={toggleEditor}>
            <Pencil size={17} />
            {editing ? 'Close editor' : 'Edit profile'}
          </Button>
          <Button variant="secondary" onClick={logout}>
            <LogOut size={17} />
            Sign out
          </Button>
        </div>
      </Card>
      {editing ? (
        <Card className="profile-editor">
          <div>
            <span className="section-kicker">PERSONAL DETAILS</span>
            <h2>Edit profile</h2>
            <p>Keep your contact details current for order and delivery updates.</p>
          </div>
          <form onSubmit={saveProfile}>
            <label className="p40-field">
              <span className="p40-label">Full name</span>
              <Input
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label className="p40-field">
              <span className="p40-label">Email</span>
              <Input
                required
                type="email"
                maxLength={160}
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="p40-field">
              <span className="p40-label">Phone</span>
              <Input
                required
                type="tel"
                maxLength={16}
                autoComplete="tel"
                placeholder="+919876543210"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>
            <div className="profile-editor__actions">
              <Button type="button" variant="secondary" onClick={cancelEditing}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}
      <div className="profile-grid">
        <Link href={ROUTES.customer.orders}>
          <Card>
            <PackageOpen />
            <h2>Orders</h2>
            <p>Track current orders and see your history.</p>
          </Card>
        </Link>
        <Link href={ROUTES.customer.addresses}>
          <Card>
            <MapPin />
            <h2>Addresses</h2>
            <p>Manage saved delivery locations.</p>
          </Card>
        </Link>
        <Card>
          <ShieldCheck />
          <h2>Account status</h2>
          <p>Your customer account is active and ready for ordering.</p>
        </Card>
      </div>
    </main>
  );
}
