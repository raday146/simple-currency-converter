import { useCallback, useState } from 'react';
import { convertCurrency } from '../api/exchangeApi';
import {
  ApiError,
  ConvertRequest,
  ConvertResponse,
  getErrorPresentation,
} from '../types/api';

export type ConvertOutcome =
  | { status: 'success' }
  | { status: 'field-error'; message: string }
  | { status: 'banner' }
  | { status: 'system' };

interface UseConversionResult {
  result: ConvertResponse | null;
  isConverting: boolean;
  systemAlert: string | null;
  bannerError: string | null;
  convert: (payload: ConvertRequest) => Promise<ConvertOutcome>;
  clearBanner: () => void;
  resetResult: () => void;
}

export function useConversion(): UseConversionResult {
  const [result, setResult] = useState<ConvertResponse | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [systemAlert, setSystemAlert] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const convert = useCallback(async (payload: ConvertRequest): Promise<ConvertOutcome> => {
    setIsConverting(true);
    setBannerError(null);

    try {
      const conversion = await convertCurrency(payload);
      setResult(conversion);
      return { status: 'success' };
    } catch (error) {
      const presentation = getErrorPresentation(error);

      if (presentation.type === 'system') {
        setSystemAlert(presentation.message);
        return { status: 'system' };
      }

      if (presentation.type === 'banner') {
        setBannerError(presentation.message);
        return { status: 'banner' };
      }

      if (error instanceof ApiError) {
        return { status: 'field-error', message: error.message };
      }

      return { status: 'field-error', message: presentation.message };
    } finally {
      setIsConverting(false);
    }
  }, []);

  const clearBanner = useCallback(() => {
    setBannerError(null);
  }, []);

  const resetResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    result,
    isConverting,
    systemAlert,
    bannerError,
    convert,
    clearBanner,
    resetResult,
  };
}
