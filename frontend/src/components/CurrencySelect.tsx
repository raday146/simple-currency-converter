interface CurrencySelectProps {
  id: string;
  label: string;
  value: string;
  currencies: string[];
  disabled?: boolean;
  error?: string | null;
  onChange: (value: string) => void;
}

export function CurrencySelect({
  id,
  label,
  value,
  currencies,
  disabled = false,
  error,
  onChange,
}: CurrencySelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        {label}
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {currencies.map((currency) => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </select>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
