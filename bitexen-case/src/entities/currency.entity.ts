import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { CommonEntity } from './common.entity';
import { Wallet } from './wallet.entity';

@Entity('currencies')
export class Currency extends CommonEntity {
  @OneToMany(() => Wallet, (Wallet) => Wallet.currency)
  wallets: Wallet[];

  @Column()
  name: string;

  @Column()
  code: string;
}
