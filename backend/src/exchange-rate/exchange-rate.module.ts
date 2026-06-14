import { Module } from '@nestjs/common';
import { ExchangeRateApiClient } from './exchange-rate-api.client';
import { ExchangeRateCache } from './exchange-rate.cache';
import { ExchangeRateController } from './exchange-rate.controller';
import { ExchangeRateService } from './exchange-rate.service';

@Module({
  controllers: [ExchangeRateController],
  providers: [ExchangeRateService, ExchangeRateApiClient, ExchangeRateCache],
})
export class ExchangeRateModule {}
