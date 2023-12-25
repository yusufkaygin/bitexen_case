import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from 'src/entities/wallet.entity';
import { Repository, UpdateResult } from 'typeorm';
import { WalletCreateDto } from './dto/create-wallet.dto';
import { WalletDepositDto } from './dto/deposit-wallet.dto';
import { Transactions } from 'src/entities/transactions.entity';
import { WalletTransferDto } from './dto/transfer.wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Transactions)
    private transactionRepository: Repository<Transactions>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  // ------------------------ find ----------------------

  findOne(query: any): Promise<Wallet> {
    return this.walletRepository.findOne({
      ...query,
      select: ['id', 'balance', 'accountId', `currencyId`],
    });
  }

  // ------------------------ create ----------------------

  create(walletCreateDto: WalletCreateDto): Promise<Wallet> {
    return this.walletRepository.save(walletCreateDto);
  }

  // ------------------------ deposit ---------------------

  deposit(walletDepositDto: WalletDepositDto): Promise<UpdateResult> {
    const { walletId, amount, accountId } = walletDepositDto;

    return this.walletRepository
      .createQueryBuilder()
      .update(Wallet)
      .set({ balance: () => `COALESCE(balance, 0) + ${amount}` }) // COALESCE(balance, 0) balance'in ilk degeri null oludugu icin ekledik
      .where('id = :walletId AND accountId = :accountId', {
        walletId,
        accountId,
      })
      .execute();
  }

  // --------------- Get User Wallets by ID ---------------

  getUserWalletsById(accountId: string) {
    return this.walletRepository.find({
      where: { accountId },
      relations: ['currency'],
      select: ['id', 'balance', 'currency'],
    });
  }

  // ---------------------- logger ------------------------

  transferLogger(walletTransferDto: WalletTransferDto): Promise<Transactions> {
    return this.transactionRepository.save(walletTransferDto);
  }
}
