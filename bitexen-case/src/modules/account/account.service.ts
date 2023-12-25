import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '../../entities/account.entity';
import { Repository } from 'typeorm';
import { AccountCreateDto } from './dto/create-account.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  // ------------------------ create ----------------------

  create(accountCreateDto: AccountCreateDto): Promise<Account> {
    return this.accountRepository.save(accountCreateDto);
  }

  // ------------------------ findOne ---------------------

  findOne(query: object): Promise<Account> {
    return this.accountRepository.findOne({ where: query });
  }
}
