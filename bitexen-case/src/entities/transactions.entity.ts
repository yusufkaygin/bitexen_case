import { Column, Entity } from 'typeorm';
import { CommonEntity } from './common.entity';

@Entity('transactions')
export class Transactions extends CommonEntity {
  @Column()
  fromAccountId: string;

  @Column()
  toAccountId: string;

  @Column()
  amount: number;

  @Column()
  currencyId: string;
}
