import { ExchangeRateCache } from './exchange-rate.cache';
import { ExternalExchangeRateResponse } from './types/external-exchange-rate-response';

const mockData: ExternalExchangeRateResponse = {
  result: 'success',
  base_code: 'USD',
  rates: { USD: 1, EUR: 0.86 },
};

describe('ExchangeRateCache', () => {
  let cache: ExchangeRateCache;

  beforeEach(() => {
    cache = new ExchangeRateCache();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns undefined when cache is empty', () => {
    expect(cache.get()).toBeUndefined();
  });

  it('returns cached entry within the 60-second TTL window', () => {
    cache.set(mockData);

    jest.advanceTimersByTime(59_000);

    expect(cache.get()?.data).toEqual(mockData);
  });

  it('marks entries stale after 60 seconds', () => {
    cache.set(mockData);

    jest.advanceTimersByTime(60_001);

    expect(cache.isStale(Date.now() - 60_001)).toBe(true);
    expect(cache.get()).toBeUndefined();
  });

  it('clears stored entries', () => {
    cache.set(mockData);
    cache.clear();
    expect(cache.get()).toBeUndefined();
  });
});
