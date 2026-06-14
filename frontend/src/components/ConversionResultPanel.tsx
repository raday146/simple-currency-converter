import { memo } from 'react';
import { ConvertResponse } from '../types/api';

interface ConversionResultPanelProps {
  result: ConvertResponse | null;
  isConverting: boolean;
}

export const ConversionResultPanel = memo(function ConversionResultPanel({
  result,
  isConverting,
}: ConversionResultPanelProps) {
  if (isConverting && !result) {
    return (
      <output className="block rounded-lg border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-400">
        Calculating conversion…
      </output>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <output className="block rounded-lg border border-slate-700 bg-slate-900/60 p-4">
      {isConverting ? (
        <p className="mb-3 text-xs text-sky-300">Updating conversion…</p>
      ) : null}
      <p className="text-sm text-slate-400">Converted amount</p>
      <p className="mt-1 text-2xl font-semibold text-sky-300 sm:text-3xl">
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
    </output>
  );
});
