import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from 'src/db/data-source-config';
import { AccountModule } from './modules/account/account.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { CoreModule } from './core.module';
import { CurrencyModule } from './modules/currency/currency.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dbConfig()),
    CoreModule, // global core module
    AccountModule,
    WalletModule,
    CurrencyModule,
  ],
})
export class AppModule {}
