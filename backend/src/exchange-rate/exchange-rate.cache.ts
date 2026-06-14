import { Injectable } from '@nestjs/common';
import { ExternalExchangeRateResponse } from './types/external-exchange-rate-response';

const CACHE_KEY = 'USD_RATES';
const TTL_MS = 60_000;

interface CacheEntry {
  data: ExternalExchangeRateResponse;
  fetchedAt: number;
}

@Injectable()
export class ExchangeRateCache {
  private readonly store = new Map<string, CacheEntry>();

  get(): CacheEntry | undefined {
    const entry = this.store.get(CACHE_KEY);
    if (!entry) {
      return undefined;
    }

    if (this.isStale(entry.fetchedAt)) {
      return undefined;
    }

    return entry;
  }

  set(data: ExternalExchangeRateResponse): CacheEntry {
    const entry: CacheEntry = { data, fetchedAt: Date.now() };
    this.store.set(CACHE_KEY, entry);
    return entry;
  }

  isStale(fetchedAt: number): boolean {
    return Date.now() - fetchedAt > TTL_MS;
  }

  clear(): void {
    this.store.clear();
  }
}
