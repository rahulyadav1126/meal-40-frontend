'use client';
import type { ServiceInterval } from '@plate40/types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export function HoursEditor({ value, onChange, disabled = false }: { value: ServiceInterval[]; onChange: (value: ServiceInterval[]) => void; disabled?: boolean }) {
  function update(index: number, field: 'opens' | 'closes', time: string) {
    onChange(value.map((slot, i) => i === index ? { ...slot, [field]: time } : slot));
  }
  return <fieldset className="p40-hours" disabled={disabled}>
    <legend className="sr-only">Weekly serving hours</legend>
    {DAYS.map((day, dayIndex) => <div className="p40-hours__day" key={day}>
      <strong>{day}</strong>
      <div className="p40-hours__intervals">
        {!value.some(slot => slot.day === dayIndex) && <span className="p40-muted">Closed</span>}
        {value.map((slot, index) => slot.day === dayIndex ? <div className="p40-hours__slot" key={index}>
          <input aria-label={`${day} opening time ${index + 1}`} type="time" required value={slot.opens} onChange={e => update(index, 'opens', e.target.value)} />
          <span>to</span>
          <input aria-label={`${day} closing time ${index + 1}`} type="time" required value={slot.closes} onChange={e => update(index, 'closes', e.target.value)} />
          <button type="button" aria-label={`Remove ${day} interval ${index + 1}`} onClick={() => onChange(value.filter((_, i) => i !== index))}>Remove</button>
          {slot.closes < slot.opens && <small>Closes next day</small>}
        </div> : null)}
      </div>
      <button type="button" className="p40-button p40-button--secondary" onClick={() => onChange([...value, { day: dayIndex, opens: '09:00', closes: '22:00' }])}>Add hours</button>
    </div>)}
    <p className="p40-muted">Remove all intervals to close a day. A closing time earlier than opening continues into the next day.</p>
  </fieldset>;
}
