'use client';
import { Cuisine } from '@plate40/types';

export function CuisinePicker({ value, onChange, disabled = false }: { value: Cuisine[]; onChange: (value: Cuisine[]) => void; disabled?: boolean }) {
  return <fieldset disabled={disabled} className="col-span-full border-0 p-0 m-0">
    <legend className="font-semibold text-sm mb-2">Cuisines</legend>
    <p className="text-sm text-slate-500 mt-0">Choose all that apply. Customers can find you by these cuisines.</p>
    <div className="flex flex-wrap gap-2">{Object.values(Cuisine).map(cuisine => <button key={cuisine} type="button" aria-pressed={value.includes(cuisine)} onClick={() => onChange(value.includes(cuisine) ? value.filter(item => item !== cuisine) : [...value, cuisine])} className={`rounded-full border px-3 py-2 text-sm font-medium transition-colors ${value.includes(cuisine) ? 'border-green-800 bg-green-800 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-green-700'}`}>{cuisine}</button>)}</div>
  </fieldset>;
}
