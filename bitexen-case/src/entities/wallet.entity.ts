import { Column, Entity, ManyToOne } from 'typeorm';
import { CommonEntity } from './common.entity';
import { Account } from './account.entity';
import { Currency } from './currency.entity';

@Entity('wallets')
export class Wallet extends CommonEntity {
  @ManyToOne(() => Account, (account) => account.id)
  account: Account;

  @ManyToOne(() => Currency, (currency) => currency.id)
  currency: Currency;

  @Column()
  accountId: string;

  @Column()
  currencyId: string;

  @Column({ nullable: true })
  balance: number;
}
