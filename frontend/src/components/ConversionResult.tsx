import { ConvertResponse } from '../types/api';

interface ConversionResultProps {
  result: ConvertResponse | null;
}

export function ConversionResult({ result }: ConversionResultProps) {
  if (!result) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
      <p className="text-sm text-slate-400">Converted amount</p>
      <p className="mt-1 text-3xl font-semibold text-sky-300">
        {result.result.toLocaleString(undefined, {
          maximumFractionDigits: 6,
        })}{' '}
        {result.to}
      </p>
      <p className="mt-3 text-sm text-slate-400">
        Rate: 1 {result.from} ={' '}
        {result.rate.toLocaleString(undefined, {
          maximumFractionDigits: 6,
        })}{' '}
        {result.to}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Last updated: {new Date(result.lastUpdated).toLocaleString()}
      </p>
    </div>
  );
}
