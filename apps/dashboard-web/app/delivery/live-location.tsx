'use client';
import { useEffect, useState } from 'react';
import { useDeliveryActiveQuery, usePublishDeliveryLocationMutation } from '@plate40/state';

// Layout-level sharing survives navigation between rider pages, not browser shutdown.
export function LiveLocation() {
  const { data, isError } = useDeliveryActiveQuery(undefined, { pollingInterval: 10000, refetchOnFocus: true });
  const activeId = data?.[0]?.id;
  const [publish] = usePublishDeliveryLocationMutation();
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => { setEnabled(false); }, [activeId, isError]);
  useEffect(() => {
    if (!activeId || !enabled || isError) return;
    if (!navigator.geolocation || !window.isSecureContext) { setMessage('Location sharing requires HTTPS and browser location access.'); return; }
    let stopped = false, sending = false, lastSent = 0;
    let latest: GeolocationPosition | null = null;
    const send = async () => {
      if (stopped || sending || !latest || Date.now() - lastSent < 5000 || Date.now() - latest.timestamp > 30000) return;
      if (!navigator.onLine) { setMessage('Offline. Location sharing will resume when connected.'); return; }
      if (latest.coords.accuracy > 200) { setMessage('GPS accuracy is low. Move outdoors or enable precise location.'); return; }
      sending = true; lastSent = Date.now();
      const current = latest;
      try {
        await publish({ id: Number(activeId), position: { latitude: current.coords.latitude, longitude: current.coords.longitude, accuracy: current.coords.accuracy, recordedAt: new Date(current.timestamp).toISOString(), ...(current.coords.heading !== null ? { heading: current.coords.heading } : {}) } }).unwrap();
        if (!stopped) setMessage(`Sharing location · last sent ${new Date().toLocaleTimeString()}`);
      } catch { if (!stopped) setMessage('Could not send location. Retrying while this delivery is active.'); }
      finally { sending = false; }
    };
    const watcher = navigator.geolocation.watchPosition(position => { latest = position; void send(); }, error => { setMessage(error.code === 1 ? 'Location permission denied. Enable it in browser settings, then restart sharing.' : 'Waiting for a GPS signal…'); }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 });
    const timer = window.setInterval(() => { void send(); }, 5000);
    return () => { stopped = true; navigator.geolocation.clearWatch(watcher); window.clearInterval(timer); };
  }, [activeId, enabled, isError, publish]);
  if (!activeId || isError) return null;
  return <aside className="mx-4 mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4" aria-label="Delivery location sharing"><div className="flex flex-wrap gap-3 items-center justify-between"><strong>Live location for your active delivery</strong><button type="button" className="p40-button p40-button--primary" onClick={() => { setEnabled(value => !value); setMessage('Requesting GPS permission…'); }}>{enabled ? 'Stop sharing' : 'Start location sharing'}</button></div><p className="text-sm mb-0" role="status">{enabled ? message : 'Share your position with the customer, store, and dispatch team during this delivery only.'}</p><p className="text-sm mb-0">Keep this app open. Browsers cannot guarantee updates when the screen is locked or the app is closed. Sharing stops when the delivery ends.</p></aside>;
}
