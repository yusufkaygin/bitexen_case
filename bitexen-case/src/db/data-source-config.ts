import * as dotenv from 'dotenv';
import { DataSourceOptions } from 'typeorm';
import { Account } from 'src/entities/account.entity';
import { Wallet } from 'src/entities/wallet.entity';
import { Currency } from 'src/entities/currency.entity';
import { Transactions } from 'src/entities/transactions.entity';

dotenv.config();

const { DB_TYPE, DB_PORT, DB_HOST, DB_PASSWORD, DB_USER_NAME, DB_NAME } =
  process.env;

export function dbConfig() {
  return {
    entities: [Account, Wallet, Currency, Transactions], // ['dist/**/*.entity.ts']
    username: DB_USER_NAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    synchronize: true,
    type: DB_TYPE,
    host: DB_HOST,
    port: DB_PORT,
    logging: true,
  } as DataSourceOptions;
}
