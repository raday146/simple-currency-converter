import { FormEvent, memo, useState } from 'react';
import { ConvertRequest } from '../types/api';
import { ConvertOutcome } from '../hooks/useConversion';
import { validateAmount, validateCurrencyCode } from '../hooks/useCurrencies';
import { AmountInput } from './AmountInput';
import { CurrencySelect } from './CurrencySelect';

interface ConverterFormProps {
  currencies: string[];
  isLoadingCurrencies: boolean;
  isConverting: boolean;
  onConvert: (payload: ConvertRequest) => Promise<ConvertOutcome>;
  onSwap: () => void;
}

export const ConverterForm = memo(function ConverterForm({
  currencies,
  isLoadingCurrencies,
  isConverting,
  onConvert,
  onSwap,
}: ConverterFormProps) {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('ILS');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [fromError, setFromError] = useState<string | null>(null);
  const [toError, setToError] = useState<string | null>(null);

  const currencyOptions = currencies.length > 0 ? currencies : ['USD', 'ILS'];
  const isFormDisabled = isLoadingCurrencies;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextAmountError = validateAmount(amount);
    const nextFromError = validateCurrencyCode(fromCurrency);
    const nextToError = validateCurrencyCode(toCurrency);

    setAmountError(nextAmountError);
    setFromError(nextFromError);
    setToError(nextToError);

    if (nextAmountError || nextFromError || nextToError) {
      return;
    }

    const outcome = await onConvert({
      amount: Number(amount),
      from: fromCurrency,
      to: toCurrency,
    });

    if (outcome.status === 'field-error') {
      const message = outcome.message.toLowerCase();
      if (message.includes('amount') || message.includes('positive')) {
        setAmountError(outcome.message);
        return;
      }
      if (message.includes('from')) {
        setFromError(outcome.message);
        return;
      }
      if (message.includes('to')) {
        setToError(outcome.message);
      }
    }
  }

  function handleSwap() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    onSwap();
  }

  return (
    <form
      className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2"
      onSubmit={handleSubmit}
    >
      <div className="md:col-span-2">
        <AmountInput
          id="amount"
          value={amount}
          disabled={isFormDisabled}
          error={amountError}
          onChange={setAmount}
        />
      </div>

      <CurrencySelect
        id="from-currency"
        label="From"
        value={fromCurrency}
        currencies={currencyOptions}
        disabled={isFormDisabled}
        error={fromError}
        onChange={setFromCurrency}
      />

      <CurrencySelect
        id="to-currency"
        label="To"
        value={toCurrency}
        currencies={currencyOptions}
        disabled={isFormDisabled}
        error={toError}
        onChange={setToCurrency}
      />

      <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
        <button
          type="submit"
          disabled={isFormDisabled || isConverting}
          className="w-full rounded-lg bg-sky-600 px-4 py-2.5 font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isConverting ? 'Converting…' : 'Convert'}
        </button>
        <button
          type="button"
          disabled={isFormDisabled || isConverting}
          onClick={handleSwap}
          className="w-full rounded-lg border border-slate-700 px-4 py-2.5 font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          Swap
        </button>
      </div>
    </form>
  );
});
