import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Currency } from 'src/entities/currency.entity';
import { Repository } from 'typeorm';
import { CurrencyCreateDto } from './dto/create-currency.dto';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
  ) {}

  // ------------------------ getAll ----------------------

  getAll(): Promise<Currency[]> {
    return this.currencyRepository.find();
  }

  // ------------------------ create ----------------------

  create(currencyCreateDto: CurrencyCreateDto): Promise<Currency> {
    return this.currencyRepository.save(currencyCreateDto);
  }
}
