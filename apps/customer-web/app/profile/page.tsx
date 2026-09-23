'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useSyncExternalStore, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  Mail,
  MapPin,
  PackageOpen,
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
      <main className="p40-container py-8 pb-16 min-h-[70vh]">
        <PageHeader
          title="Your Plate40 account"
          description="Sign in to manage your profile, orders, and delivery addresses."
        />
        <Card className="p-12 px-6 grid justify-items-center gap-2.5 text-center mt-8">
          <UserRound size={32} className="text-p40-primary" />
          <h2 className="m-0">You are not signed in</h2>
          <p className="m-0 text-p40-muted">Create an account or sign in to start ordering.</p>
          <div className="flex gap-2.5 mt-2">
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
    <main className="max-w-[1200px] mx-auto mt-12 mb-24 px-6">
      <div className="bg-[#273249] text-white p-6 md:p-10 md:px-12 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 shadow-p40-2">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] shrink-0 rounded-full bg-[#fc8019] text-white text-3xl font-[800] grid place-items-center shadow-[0_4px_10px_rgba(252,128,25,0.4)]">{user.name.slice(0, 1).toUpperCase()}</div>
          <div>
            <h1 className="text-3xl m-0 mb-1 font-[800]">{user.name}</h1>
            <p className="text-slate-300 text-base m-0">{user.phone} &nbsp;&bull;&nbsp; {user.email}</p>
          </div>
        </div>
        <button className="bg-transparent border border-white/40 text-white py-2.5 px-5 font-bold text-[0.85rem] tracking-[0.05em] rounded-md cursor-pointer transition-[background,border-color] duration-200 hover:bg-white/10 hover:border-white" onClick={toggleEditor}>
          {editing ? 'CANCEL EDIT' : 'EDIT PROFILE'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 md:gap-10 items-start">
        <ul className="list-none m-0 py-4">
          <li className="flex items-center gap-4 py-5 px-6 text-[#fc8019] font-semibold text-[1.05rem] no-underline cursor-pointer border-l-4 bg-[#fff8f3] w-full text-left border-[#fc8019]">
            <UserRound size={20} className="text-[#fc8019]" /> Profile
          </li>
          <li>
            <Link href={ROUTES.customer.orders} className="group flex items-center gap-4 py-5 px-6 text-[#3d4152] font-semibold text-[1.05rem] no-underline cursor-pointer transition-[background,color] duration-200 border-l-4 border-transparent bg-transparent w-full text-left hover:bg-[#fff8f3] hover:text-[#fc8019] hover:border-[#fc8019]">
              <PackageOpen size={20} className="text-slate-400 transition-colors duration-200 group-hover:text-[#fc8019]" /> Orders
            </Link>
          </li>
          <li>
            <Link href={ROUTES.customer.addresses} className="group flex items-center gap-4 py-5 px-6 text-[#3d4152] font-semibold text-[1.05rem] no-underline cursor-pointer transition-[background,color] duration-200 border-l-4 border-transparent bg-transparent w-full text-left hover:bg-[#fff8f3] hover:text-[#fc8019] hover:border-[#fc8019]">
              <MapPin size={20} className="text-slate-400 transition-colors duration-200 group-hover:text-[#fc8019]" /> Addresses
            </Link>
          </li>
          <div className="h-[1px] bg-p40-border mx-6 my-2" />
          <li className="flex items-center gap-4 py-5 px-6 text-rose-600 font-semibold text-[1.05rem] no-underline cursor-pointer transition-[background,color] duration-200 border-l-4 border-transparent bg-transparent w-full text-left hover:bg-rose-50" onClick={logout}>
            <LogOut size={20} color="#e11d48" /> Sign out
          </li>
        </ul>

        <div className="bg-white rounded-xl p-6 md:p-10 shadow-p40-1 min-h-[400px]">
          {editing ? (
            <>
              <h2 className="text-2xl mt-0 mb-2 text-[#282c3f]">Edit Profile</h2>
              <p className="text-[#686b78] mb-8">Keep your contact details current for order and delivery updates.</p>
              <form onSubmit={saveProfile}>
                <div className="grid gap-4">
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
                </div>
                <div className="col-span-full flex justify-end gap-2.5 mt-8">
                  <Button type="button" variant="secondary" onClick={cancelEditing}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl mt-0 mb-2 text-[#282c3f]">Account Status</h2>
              <p className="text-[#686b78] mb-8">Your customer account is active and ready for ordering.</p>
              
              <div className="mt-10 bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h3 className="m-0 mb-4 text-[1.1rem] text-slate-700">Profile Summary</h3>
                <div className="grid gap-3 text-slate-600 text-[0.95rem]">
                  <div className="flex gap-4 items-center"><UserRound size={18} /> <span>{user.name}</span></div>
                  <div className="flex gap-4 items-center"><Mail size={18} /> <span>{user.email}</span></div>
                  <div className="flex gap-4 items-center"><Phone size={18} /> <span>{user.phone}</span></div>
                  <div className="flex gap-4 items-center"><ShieldCheck size={18} color="#10b981" /> <span className="text-emerald-500 font-semibold">Verified Customer</span></div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
