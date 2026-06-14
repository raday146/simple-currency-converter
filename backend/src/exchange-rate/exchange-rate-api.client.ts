import { BadGatewayException, Injectable } from '@nestjs/common';
import { ExternalExchangeRateResponse } from './types/external-exchange-rate-response';

@Injectable()
export class ExchangeRateApiClient {
  private readonly apiUrl =
    process.env.EXTERNAL_API_URL ?? 'https://open.er-api.com/v6/latest/USD';

  async fetchLatestRates(): Promise<ExternalExchangeRateResponse> {
    try {
      const response = await fetch(this.apiUrl);

      if (!response.ok) {
        throw new BadGatewayException('Exchange network unavailable. Please try again later.');
      }

      const data = (await response.json()) as ExternalExchangeRateResponse;

      if (data.result !== 'success' || !data.rates) {
        throw new BadGatewayException('Exchange network unavailable. Please try again later.');
      }

      return data;
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }

      throw new BadGatewayException('Exchange network unavailable. Please try again later.');
    }
  }
}
