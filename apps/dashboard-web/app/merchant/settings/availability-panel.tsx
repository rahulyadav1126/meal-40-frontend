'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { useUpdateAvailabilityMutation } from '@plate40/state';
import type { AvailabilitySettings, Restaurant } from '@plate40/types';
import { Button, Card, HoursEditor } from '@plate40/ui';

export function AvailabilityPanel({ restaurant }: { restaurant: Restaurant }) {
  const [settings, setSettings] = useState<AvailabilitySettings>(restaurant.availabilitySettings ?? {
    timezone: 'Asia/Kolkata', availabilityMode: restaurant.openingStatus === 'OPEN' ? 'FORCED_OPEN' : 'FORCED_CLOSED',
    weeklyHours: [], exceptions: [], overrideReason: '', overrideExpiresAt: null,
  });
  const [save, { isLoading }] = useUpdateAvailabilityMutation();
  const [error, setError] = useState('');
  const [duration, setDuration] = useState('keep');
  const [date, setDate] = useState('');
  const patch = (change: Partial<AvailabilitySettings>) => setSettings(current => ({ ...current, ...change }));
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError('');
    const overrideExpiresAt = settings.availabilityMode === 'SCHEDULED' ? null : duration === 'keep' ? settings.overrideExpiresAt : duration === 'indefinite' ? null : new Date(Date.now() + Number(duration) * 60000).toISOString();
    try {
      await save({ id: Number(restaurant.id), data: { ...settings, overrideExpiresAt, expectedVersion: restaurant.availabilityVersion ?? 0 } }).unwrap();
      toast.success('Availability saved. Existing orders will continue.');
    } catch (err) { setError((err as { data?: { message?: string } })?.data?.message ?? 'Could not save. Refresh if another staff member changed these settings.'); }
  }
  return <Card className="p40-availability-panel">
    <div className="p40-section-intro"><div><span className="p40-eyebrow">STORE AVAILABILITY</span><h2>Open on your terms</h2><p>Set your regular hours or temporarily change when you accept new orders.</p></div>
      <span className={`p40-badge p40-badge--${restaurant.isAcceptingOrders ? 'success' : 'warning'}`}>{restaurant.isAcceptingOrders ? 'Accepting orders' : 'Closed'}</span>
    </div>
    <form onSubmit={submit} className="grid gap-6">
      <fieldset disabled={isLoading} className="border-0 p-0 m-0 grid gap-5">
        <div className="p40-mode-options" role="group" aria-label="Availability mode">
          {([['SCHEDULED', 'Follow hours', 'Open and close automatically'], ['FORCED_OPEN', 'Open now', 'Override your regular hours'], ['FORCED_CLOSED', 'Close now', 'Pause new orders']] as const).map(([mode, title, text]) => <button key={mode} type="button" aria-pressed={settings.availabilityMode === mode} onClick={() => { patch({ availabilityMode: mode }); setDuration(mode === 'FORCED_OPEN' ? '60' : mode === 'FORCED_CLOSED' ? '30' : 'keep'); }}><strong>{title}</strong><small>{text}</small></button>)}
        </div>
        {settings.availabilityMode !== 'SCHEDULED' && <div className="p40-form-grid">
          <label className="p40-field">Reason<input className="p40-input" maxLength={200} value={settings.overrideReason ?? ''} onChange={e => patch({ overrideReason: e.target.value })} placeholder="Kitchen break, extra service hours…" /></label>
          <label className="p40-field">Return to schedule<select className="p40-input" value={duration} onChange={e => setDuration(e.target.value)}>
            <option value="keep">Keep current expiry</option><option value="30">In 30 minutes</option><option value="60">In 1 hour</option><option value="120">In 2 hours</option><option value="indefinite">Until I change it manually</option>
          </select></label>
          {settings.overrideExpiresAt && <p className="p40-muted">Current override expires {new Date(settings.overrideExpiresAt).toLocaleString()}.</p>}
        </div>}
        <label className="p40-field">Restaurant timezone<input className="p40-input" required value={settings.timezone} onChange={e => patch({ timezone: e.target.value })} placeholder="Asia/Kolkata" /></label>
        <div><h3>Weekly hours</h3><HoursEditor value={settings.weeklyHours} onChange={weeklyHours => patch({ weeklyHours })} /></div>
        <div><h3>Special dates</h3><p className="p40-muted">Override normal hours for holidays. An empty date stays closed.</p>
          {settings.exceptions.map((exception, index) => <div className="p40-exception" key={exception.date}>
            <div className="flex justify-between items-center gap-3"><strong>{exception.date}</strong><Button variant="secondary" type="button" onClick={() => patch({ exceptions: settings.exceptions.filter((_, i) => i !== index) })}>Remove date</Button></div>
            {!exception.intervals.length && <p>Closed all day</p>}
            {exception.intervals.map((slot, j) => <div className="p40-hours__slot" key={j}>
              {(['opens', 'closes'] as const).map(field => <label key={field}>{field === 'opens' ? 'Opens' : 'Closes'}<input type="time" required value={slot[field]} onChange={e => patch({ exceptions: settings.exceptions.map((ex, i) => i === index ? { ...ex, intervals: ex.intervals.map((s, k) => k === j ? { ...s, [field]: e.target.value } : s) } : ex) })} /></label>)}
              <button type="button" onClick={() => patch({ exceptions: settings.exceptions.map((ex, i) => i === index ? { ...ex, intervals: ex.intervals.filter((_, k) => k !== j) } : ex) })}>Remove hours</button>
            </div>)}
            <Button type="button" variant="secondary" onClick={() => patch({ exceptions: settings.exceptions.map((ex, i) => i === index ? { ...ex, intervals: [...ex.intervals, { opens: '09:00', closes: '22:00' }] } : ex) })}>Add special hours</Button>
          </div>)}
          <div className="flex flex-wrap gap-3 mt-3"><input aria-label="Special date" className="p40-input max-w-56" type="date" value={date} onChange={e => setDate(e.target.value)} /><Button type="button" variant="secondary" disabled={!date || settings.exceptions.some(e => e.date === date)} onClick={() => { patch({ exceptions: [...settings.exceptions, { date, intervals: [] }] }); setDate(''); }}>Add date</Button></div>
        </div>
      </fieldset>
      {error && <p role="alert" className="p40-field-error">{error}</p>}
      <div className="flex flex-wrap items-center gap-4"><Button type="submit" disabled={isLoading}>{isLoading ? 'Saving…' : 'Save availability'}</Button><span className="p40-muted">Administrative restrictions always apply.</span></div>
    </form>
  </Card>;
}
