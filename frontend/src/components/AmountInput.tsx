interface AmountInputProps {
  id: string;
  value: string;
  disabled?: boolean;
  error?: string | null;
  onChange: (value: string) => void;
}

export function AmountInput({
  id,
  value,
  disabled = false,
  error,
  onChange,
}: AmountInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        Amount
      </label>
      <input
        id={id}
        type="number"
        min="0"
        step="any"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        placeholder="Enter amount"
      />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
