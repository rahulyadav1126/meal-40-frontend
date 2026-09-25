'use client';
import type { OrderTracking } from '@plate40/types';

export function DeliveryMap({ tracking, loading, error, onRetry }: { tracking?: OrderTracking; loading?: boolean; error?: boolean; onRetry?: () => void }) {
  const data = error ? undefined : tracking;
  return <section className="p40-card overflow-hidden my-4" aria-label="Live delivery map">
    <div className="p-4 flex flex-wrap justify-between gap-3 items-center"><div><span className="p40-eyebrow">DELIVERY TRACKING</span><h3 className="my-1">{data?.active ? data.leg === 'PICKUP' ? 'Rider heading to the store' : 'Rider heading to the destination' : 'Store → delivery destination'}</h3></div>
      <span role="status" className="text-sm text-slate-600">{error ? 'Tracking unavailable' : loading && !data ? 'Loading map…' : data?.active ? data.stale ? 'GPS signal delayed' : 'Location updating' : 'Not currently tracking'}</span></div>
    {data?.map.image ? <img src={data.map.image} alt="Google map: S marks the store, R the rider, and D the destination. The line is the road route for the current delivery stage." className="block w-full h-auto" /> : <div className="bg-slate-50 p-8 text-center text-slate-600">{error ? 'Unable to load tracking. Your order can still continue.' : data?.map.message ?? 'The map will appear when a rider is assigned.'}</div>}
    <div className="p-4 grid gap-2 text-sm text-slate-600">
      {data?.active && <p className="m-0">S — Store · R — Rider · D — Destination. Map refreshes about every 20 seconds.</p>}
      {data?.rider && <p className="m-0">Last GPS update: {new Date(data.rider.recordedAt).toLocaleTimeString()} · accuracy ±{Math.round(data.rider.accuracy)} m{data.stale ? '. This location is stale; a live ETA is unavailable.' : ''}</p>}
      {data?.active && !data.stale && data.map.routeAvailable && data.map.durationSeconds !== null && <p className="m-0 font-semibold text-slate-900">About {Math.max(1, Math.ceil(data.map.durationSeconds / 60))} min{data.map.distanceMeters !== null ? ` · ${(data.map.distanceMeters / 1000).toFixed(1)} km` : ''} to {data.leg === 'PICKUP' ? 'pickup' : 'drop-off'} <span className="font-normal">(estimate, not a promised arrival time)</span></p>}
      {data?.map.image && data.map.message && <p className="m-0">{data.map.message}</p>}
      <div className="flex flex-wrap gap-4">{data?.navigationUrl && <a className="underline font-semibold" href={data.navigationUrl} target="_blank" rel="noreferrer">Open directions in Google Maps</a>}{error && onRetry && <button className="underline" onClick={onRetry}>Retry tracking</button>}</div>
    </div>
  </section>;
}
