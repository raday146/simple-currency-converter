import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRateApiClient } from '../providers/exchange-rate-api.client';
import { ExchangeRateCache } from '../cache/exchange-rate.cache';
import { ExchangeRateService } from '../exchange-rate.service';
import { ExternalExchangeRateResponse } from '../types/external-exchange-rate-response';

const mockRates: ExternalExchangeRateResponse = {
  result: 'success',
  base_code: 'USD',
  rates: {
    USD: 1,
    EUR: 0.864531,
    ILS: 2.925152,
    GBP: 0.746107,
  },
};

describe('ExchangeRateService', () => {
  let service: ExchangeRateService;
  let apiClient: jest.Mocked<ExchangeRateApiClient>;
  let cache: ExchangeRateCache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRateService,
        ExchangeRateCache,
        {
          provide: ExchangeRateApiClient,
          useValue: {
            fetchLatestRates: jest.fn().mockResolvedValue(mockRates),
          },
        },
      ],
    }).compile();

    service = module.get(ExchangeRateService);
    apiClient = module.get(ExchangeRateApiClient);
    cache = module.get(ExchangeRateCache);
    cache.clear();
  });

  it('converts USD to ILS using the formula amount * (rates[to] / rates[from])', async () => {
    const result = await service.convert({
      amount: 100,
      from: 'USD',
      to: 'ILS',
    });

    expect(result.rate).toBeCloseTo(2.925152, 5);
    expect(result.result).toBeCloseTo(292.5152, 3);
    expect(result.from).toBe('USD');
    expect(result.to).toBe('ILS');
  });

  it('converts EUR to GBP using cross-rate math', async () => {
    const result = await service.convert({
      amount: 50,
      from: 'EUR',
      to: 'GBP',
    });

    const expectedRate = mockRates.rates.GBP / mockRates.rates.EUR;
    expect(result.rate).toBeCloseTo(expectedRate, 5);
    expect(result.result).toBeCloseTo(50 * expectedRate, 5);
  });

  it('throws for unsupported currency codes', async () => {
    await expect(
      service.convert({ amount: 10, from: 'USD', to: 'XYZ' }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.convert({ amount: 10, from: 'XYZ', to: 'USD' }),
    ).rejects.toThrow('Currency code XYZ is not supported.');
  });

  it('returns sorted currency list from cached rates', async () => {
    const result = await service.getCurrencies();

    expect(result.base).toBe('USD');
    expect(result.currencies).toEqual(['EUR', 'GBP', 'ILS', 'USD']);
    expect(result.lastUpdated).toBeDefined();
    expect(apiClient.fetchLatestRates).toHaveBeenCalledTimes(1);
  });

  it('reuses cache within TTL window', async () => {
    await service.getCurrencies();
    await service.convert({ amount: 1, from: 'USD', to: 'EUR' });

    expect(apiClient.fetchLatestRates).toHaveBeenCalledTimes(1);
  });
});
