import { BadRequestException, Injectable } from '@nestjs/common';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import { ExchangeRateApiClient } from './providers/exchange-rate-api.client';
import { ExchangeRateCache } from './cache/exchange-rate.cache';
import { ExternalExchangeRateResponse } from './types/external-exchange-rate-response';

export interface CurrenciesResponse {
  base: string;
  currencies: string[];
  lastUpdated: string;
}

export interface ConvertResponse {
  amount: number;
  from: string;
  to: string;
  rate: number;
  result: number;
  lastUpdated: string;
}

@Injectable()
export class ExchangeRateService {
  constructor(
    private readonly apiClient: ExchangeRateApiClient,
    private readonly cache: ExchangeRateCache,
  ) {}

  async getCurrencies(): Promise<CurrenciesResponse> {
    const entry = await this.getFreshRates();
    return {
      base: entry.data.base_code,
      currencies: Object.keys(entry.data.rates).sort(),
      lastUpdated: new Date(entry.fetchedAt).toISOString(),
    };
  }

  async convert(dto: ConvertCurrencyDto): Promise<ConvertResponse> {
    const entry = await this.getFreshRates();
    const { rates } = entry.data;

    this.assertCurrencySupported(dto.from, rates);
    this.assertCurrencySupported(dto.to, rates);

    const rate = rates[dto.to] / rates[dto.from];
    const result = dto.amount * rate;

    return {
      amount: dto.amount,
      from: dto.from,
      to: dto.to,
      rate,
      result,
      lastUpdated: new Date(entry.fetchedAt).toISOString(),
    };
  }

  private async getFreshRates() {
    const cached = this.cache.get();
    if (cached) {
      return cached;
    }

    const data = await this.apiClient.fetchLatestRates();
    return this.cache.set(data);
  }

  private assertCurrencySupported(
    code: string,
    rates: ExternalExchangeRateResponse['rates'],
  ): void {
    if (!(code in rates)) {
      throw new BadRequestException(`Currency code ${code} is not supported.`);
    }
  }
}
