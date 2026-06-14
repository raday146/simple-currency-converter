import { FormEvent, useState } from 'react';
import { convertCurrency } from '../api/exchangeApi';
import {
  useCurrencies,
  validateAmount,
  validateCurrencyCode,
} from '../hooks/useCurrencies';
import { ApiError, ConvertResponse, getErrorPresentation } from '../types/api';
import { AmountInput } from './AmountInput';
import { ConversionResult } from './ConversionResult';
import { CurrencySelect } from './CurrencySelect';
import { ErrorBanner } from './ErrorBanner';

export function CurrencyConverter() {
  const { currencies, isLoading, errorMessage: loadError } = useCurrencies();
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('ILS');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [fromError, setFromError] = useState<string | null>(null);
  const [toError, setToError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<ConvertResponse | null>(null);

  const isDisabled = isLoading || isConverting || currencies.length === 0;

  function handleSwap() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
    setBannerError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextAmountError = validateAmount(amount);
    const nextFromError = validateCurrencyCode(fromCurrency);
    const nextToError = validateCurrencyCode(toCurrency);

    setAmountError(nextAmountError);
    setFromError(nextFromError);
    setToError(nextToError);
    setBannerError(null);
    setResult(null);

    if (nextAmountError || nextFromError || nextToError) {
      return;
    }

    setIsConverting(true);

    try {
      const conversion = await convertCurrency({
        amount: Number(amount),
        from: fromCurrency,
        to: toCurrency,
      });
      setResult(conversion);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 400) {
        if (error.message.includes('amount') || error.message.includes('positive')) {
          setAmountError(error.message);
          return;
        }
      }

      const presentation = getErrorPresentation(error);
      setBannerError(presentation.message);
    } finally {
      setIsConverting(false);
    }
  }

  return (
    <section className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-100">Currency Converter</h1>
        <p className="mt-1 text-sm text-slate-400">
          Convert amounts using live exchange rates.
        </p>
      </header>

      {loadError ? <ErrorBanner message={loadError} /> : null}
      {bannerError ? <ErrorBanner message={bannerError} /> : null}

      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <div className="md:col-span-2">
          <AmountInput
            id="amount"
            value={amount}
            disabled={isDisabled}
            error={amountError}
            onChange={setAmount}
          />
        </div>

        <CurrencySelect
          id="from-currency"
          label="From"
          value={fromCurrency}
          currencies={currencies.length > 0 ? currencies : ['USD']}
          disabled={isDisabled}
          error={fromError}
          onChange={setFromCurrency}
        />

        <CurrencySelect
          id="to-currency"
          label="To"
          value={toCurrency}
          currencies={currencies.length > 0 ? currencies : ['ILS']}
          disabled={isDisabled}
          error={toError}
          onChange={setToCurrency}
        />

        <div className="flex flex-wrap gap-3 md:col-span-2">
          <button
            type="submit"
            disabled={isDisabled}
            className="rounded-lg bg-sky-600 px-4 py-2 font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isConverting ? 'Converting…' : 'Convert'}
          </button>
          <button
            type="button"
            disabled={isDisabled}
            onClick={handleSwap}
            className="rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Swap
          </button>
        </div>
      </form>

      {isLoading ? (
        <p className="mt-6 text-sm text-slate-400">Loading currencies…</p>
      ) : null}

      <div className="mt-6">
        <ConversionResult result={result} />
      </div>
    </section>
  );
}
