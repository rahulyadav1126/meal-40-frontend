'use client';
import type { OrderTracking } from '@plate40/types';

export function DeliveryMap({ tracking, loading, error, onRetry, riderView = false }: { tracking?: OrderTracking; loading?: boolean; error?: boolean; onRetry?: () => void; riderView?: boolean }) {
  const data = error ? undefined : tracking;
  const destination = data?.leg === 'DROPOFF' ? 'customer' : 'restaurant';
  return <section className="overflow-hidden rounded-2xl border border-slate-200 my-4 bg-white shadow-sm" aria-label="Live delivery map">
    <div className="p-4 sm:p-5 flex flex-wrap justify-between gap-3 items-center bg-green-950 text-white"><div><span className="text-xs tracking-widest text-green-200 uppercase">{riderView ? 'Your route' : 'Delivery tracking'}</span><h3 className="my-1 text-lg font-semibold">{data?.active ? riderView ? `Next stop: ${destination}` : data.leg === 'PICKUP' ? 'Rider heading to the store' : 'Your food is on its way' : 'Store → delivery destination'}</h3></div>
      <span role="status" className="rounded-full bg-white/10 px-3 py-1.5 text-xs">{error ? 'Tracking unavailable' : loading && !data ? 'Loading map…' : data?.active ? data.stale ? 'GPS signal delayed' : data.rider ? 'Location updating' : 'Waiting for GPS' : 'Not currently tracking'}</span></div>
    {data?.map.image ? <img src={data.map.image} alt="Google map: S marks the store, R the rider, and D the destination. The line is the road route for the current delivery stage." className="block w-full h-auto" /> : <div className="bg-slate-50 p-10 text-center text-slate-600 min-h-48 grid place-items-center">{error ? 'Unable to load tracking. Your order can still continue.' : data?.map.message ?? 'The map will appear when a rider is assigned.'}</div>}
    <div className="p-4 grid gap-2 text-sm text-slate-600">
      {data?.active && <p className="m-0">S — Store · R — Rider · D — Destination. Map refreshes about every 20 seconds.</p>}
      {data?.rider && <p className="m-0">Last GPS update: {new Date(data.rider.recordedAt).toLocaleTimeString()} · accuracy ±{Math.round(data.rider.accuracy)} m{data.stale ? '. This location is stale; a live ETA is unavailable.' : ''}</p>}
      {data?.active && !data.stale && data.map.routeAvailable && data.map.durationSeconds !== null && <p className="m-0 font-semibold text-slate-900">About {Math.max(1, Math.ceil(data.map.durationSeconds / 60))} min{data.map.distanceMeters !== null ? ` · ${(data.map.distanceMeters / 1000).toFixed(1)} km` : ''} to {data.leg === 'PICKUP' ? 'pickup' : 'drop-off'} <span className="font-normal">(estimate, not a promised arrival time)</span></p>}
      {data?.map.image && data.map.message && <p className="m-0">{data.map.message}</p>}
      <div className="flex flex-wrap gap-4 pt-2">{data?.navigationUrl && <a className="rounded-xl bg-green-800 px-4 py-3 text-white font-semibold text-center flex-1" href={data.navigationUrl} target="_blank" rel="noreferrer">{riderView ? `Navigate to ${destination}` : 'Open directions'} ↗</a>}{error && onRetry && <button type="button" className="underline" onClick={onRetry}>Retry tracking</button>}</div>
    </div>
  </section>;
}
