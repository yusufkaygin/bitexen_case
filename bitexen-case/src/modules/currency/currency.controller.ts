import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrencyService } from './currency.service';
import { CurrencyCreateDto } from './dto/create-currency.dto';
import { createResponse } from 'src/utils/createResponse.utils';

@ApiTags('Currency')
@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('all')
  @ApiOperation({
    summary: 'Sistemdeki tüm para birimlerini listeler',
  })
  async getAll() {
    const currencies = await this.currencyService.getAll();

    return createResponse({
      message: {
        message: 'Para birimleri başarıyla getirildi.',
        data: currencies,
      },
    });
  }

  @Post('create')
  @ApiOperation({
    summary: 'Yeni bir para birimi oluşturur',
  })
  async create(@Body() currencyCreateDto: CurrencyCreateDto) {
    const currency = await this.currencyService.create(currencyCreateDto);

    return createResponse({
      message: {
        message: 'Para birimi başarıyla oluşturuldu.',
        data: currency,
      },
    });
  }
}
