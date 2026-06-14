import { IsNotEmpty, IsNumber, IsPositive, IsString, Matches } from 'class-validator';

export class ConvertCurrencyDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{3}$/, { message: 'from must be a 3-letter uppercase currency code' })
  from: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{3}$/, { message: 'to must be a 3-letter uppercase currency code' })
  to: string;
}
