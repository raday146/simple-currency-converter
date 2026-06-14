import { Module } from '@nestjs/common';
import { ExchangeRateModule } from './exchange-rate/exchange-rate.module';

@Module({
  imports: [ExchangeRateModule],
})
export class AppModule {}
