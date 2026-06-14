import {
  ApiError,
  ApiErrorBody,
  ConvertRequest,
  ConvertResponse,
  CurrenciesResponse,
} from '../types/api';

const API_BASE = '/api';

async function parseResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T | ApiErrorBody;

  if (!response.ok) {
    const errorBody = body as ApiErrorBody;
    throw new ApiError(
      errorBody.statusCode ?? response.status,
      errorBody.message ?? 'Request failed',
    );
  }

  return body as T;
}

export async function fetchCurrencies(): Promise<CurrenciesResponse> {
  const response = await fetch(`${API_BASE}/currencies`);
  return parseResponse<CurrenciesResponse>(response);
}

export async function convertCurrency(
  payload: ConvertRequest,
): Promise<ConvertResponse> {
  const response = await fetch(`${API_BASE}/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseResponse<ConvertResponse>(response);
}
