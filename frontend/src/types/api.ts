export interface ApiErrorBody {
  statusCode: number;
  message: string;
  error: string;
}

export interface CurrenciesResponse {
  base: string;
  currencies: string[];
  lastUpdated: string;
}

export interface ConvertRequest {
  amount: number;
  from: string;
  to: string;
}

export interface ConvertResponse {
  amount: number;
  from: string;
  to: string;
  rate: number;
  result: number;
  lastUpdated: string;
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getErrorPresentation(error: unknown): {
  type: 'field' | 'banner';
  message: string;
} {
  if (error instanceof ApiError) {
    if (error.statusCode === 400) {
      if (error.message.includes('is not supported')) {
        return { type: 'banner', message: error.message };
      }

      return { type: 'field', message: error.message };
    }

    if (error.statusCode === 502) {
      return {
        type: 'banner',
        message: 'Exchange network unavailable. Please try again later.',
      };
    }

    if (error.statusCode === 500) {
      return {
        type: 'banner',
        message: 'An unexpected error occurred.',
      };
    }
  }

  return {
    type: 'banner',
    message: 'An unexpected error occurred.',
  };
}
