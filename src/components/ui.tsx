import type { CSSProperties, ReactNode } from 'react';
import { Minus, Plus } from 'lucide-react';

export function Stepper({ value, min, max, onChange, label }: {
  value: number; min: number; max: number; onChange: (v: number) => void; label: string;
}) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" className="stepper__btn" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Fewer ${label}`}>
        <Minus size={16} />
      </button>
      <output className="stepper__value" aria-live="polite">{value}</output>
      <button type="button" className="stepper__btn" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`More ${label}`}>
        <Plus size={16} />
      </button>
    </div>
  );
}

export function Segmented<T extends string | number>({ value, options, onChange, label, format = String }: {
  value: T; options: readonly T[]; onChange: (v: T) => void; label: string; format?: (v: T) => string;
}) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          role="radio"
          aria-checked={opt === value}
          className="segmented__opt"
          onClick={() => onChange(opt)}
        >
          {format(opt)}
        </button>
      ))}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="switch" onClick={() => onChange(!checked)}>
      <span className="switch__thumb" />
    </button>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="field">
      <div className="field__text">
        <span className="field__label">{label}</span>
        {hint && <span className="field__hint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="kbd">{children}</kbd>;
}

/** Typed helper for passing CSS custom properties through `style`. */
export const vars = (values: Record<`--${string}`, string | number | undefined>) => values as CSSProperties;
