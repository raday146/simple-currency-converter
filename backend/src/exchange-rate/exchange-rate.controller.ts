import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import { ExchangeRateService } from './exchange-rate.service';

@Controller()
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get('currencies')
  getCurrencies() {
    return this.exchangeRateService.getCurrencies();
  }

  @Post('convert')
  @HttpCode(HttpStatus.OK)
  convert(@Body() dto: ConvertCurrencyDto) {
    return this.exchangeRateService.convert(dto);
  }
}
