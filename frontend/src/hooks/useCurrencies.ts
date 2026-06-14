import { useEffect, useState } from 'react';
import { fetchCurrencies } from '../api/exchangeApi';
import { getErrorPresentation } from '../types/api';

interface UseCurrenciesResult {
  currencies: string[];
  isLoading: boolean;
  systemAlert: string | null;
  bannerError: string | null;
}

export function useCurrencies(): UseCurrenciesResult {
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [systemAlert, setSystemAlert] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrencies() {
      try {
        const data = await fetchCurrencies();
        if (isMounted) {
          setCurrencies(data.currencies);
          setSystemAlert(null);
          setBannerError(null);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const presentation = getErrorPresentation(error);
        if (presentation.type === 'system') {
          setSystemAlert(presentation.message);
        } else {
          setBannerError(presentation.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCurrencies();

    return () => {
      isMounted = false;
    };
  }, []);

  return { currencies, isLoading, systemAlert, bannerError };
}

export function validateAmount(value: string): string | null {
  if (!value.trim()) {
    return 'Amount is required.';
  }

  const amount = Number(value);
  if (Number.isNaN(amount) || amount <= 0) {
    return 'Amount must be a positive number.';
  }

  return null;
}

export function validateCurrencyCode(code: string): string | null {
  if (!code) {
    return 'Currency is required.';
  }

  if (!/^[A-Z]{3}$/.test(code)) {
    return 'Select a valid 3-letter currency code.';
  }

  return null;
}
