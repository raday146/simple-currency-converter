import { memo } from 'react';
import { ConverterForm } from './ConverterForm';
import { ConversionResultPanel } from './ConversionResultPanel';
import { ErrorBanner } from './ErrorBanner';
import { SystemAlert } from './SystemAlert';
import { useConversion } from '../hooks/useConversion';
import { useCurrencies } from '../hooks/useCurrencies';

export const CurrencyConverter = memo(function CurrencyConverter() {
  const { currencies, isLoading, systemAlert: loadSystemAlert, bannerError: loadBannerError } =
    useCurrencies();
  const {
    result,
    isConverting,
    systemAlert: convertSystemAlert,
    bannerError: convertBannerError,
    convert,
    clearBanner,
    resetResult,
  } = useConversion();

  const systemAlert = convertSystemAlert ?? loadSystemAlert;
  const bannerError = convertBannerError ?? loadBannerError;

  return (
    <div className="flex w-full max-w-lg flex-col sm:max-w-xl md:max-w-2xl">
      {systemAlert ? (
        <div className="mb-4 w-full">
          <SystemAlert message={systemAlert} />
        </div>
      ) : null}

      <section className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-xl sm:p-6">
        <header className="mb-5 sm:mb-6">
          <h1 className="text-xl font-semibold text-slate-100 sm:text-2xl">
            Currency Converter
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Convert amounts using live exchange rates.
          </p>
        </header>

        {bannerError ? (
          <div className="mb-4">
            <ErrorBanner message={bannerError} onDismiss={clearBanner} />
          </div>
        ) : null}

        <ConverterForm
          currencies={currencies}
          isLoadingCurrencies={isLoading}
          isConverting={isConverting}
          onConvert={convert}
          onSwap={resetResult}
        />

        {isLoading ? (
          <p className="mt-5 text-sm text-slate-400">Loading currencies…</p>
        ) : null}

        <div className="mt-5 sm:mt-6">
          <ConversionResultPanel result={result} isConverting={isConverting} />
        </div>
      </section>
    </div>
  );
});
