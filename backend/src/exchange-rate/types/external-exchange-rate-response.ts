export interface ExternalExchangeRateResponse {
  result: string;
  base_code: string;
  rates: Record<string, number>;
}
