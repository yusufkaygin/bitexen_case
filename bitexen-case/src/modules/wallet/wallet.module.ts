import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from '../../entities/wallet.entity';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Transactions } from 'src/entities/transactions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Transactions])],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
