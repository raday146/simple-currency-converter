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

export type ErrorPresentationType = 'field' | 'banner' | 'system';

export interface ErrorPresentation {
  type: ErrorPresentationType;
  message: string;
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

export function getErrorPresentation(error: unknown): ErrorPresentation {
  if (error instanceof ApiError) {
    if (error.statusCode === 400) {
      return { type: 'field', message: error.message };
    }

    if (error.statusCode === 404) {
      return {
        type: 'banner',
        message: 'The requested currency code is unsupported.',
      };
    }

    if (error.statusCode === 502) {
      return {
        type: 'system',
        message: 'Upstream exchange network down. Please try again later.',
      };
    }

    if (error.statusCode === 500) {
      return {
        type: 'system',
        message: 'An unexpected error occurred.',
      };
    }
  }

  return {
    type: 'system',
    message: 'An unexpected error occurred.',
  };
}
