import { Column, Entity, OneToMany } from 'typeorm';
import { CommonEntity } from './common.entity';
import { Wallet } from './wallet.entity';

@Entity('accounts')
export class Account extends CommonEntity {
  @OneToMany(() => Wallet, (wallet) => wallet.account)
  wallets: Wallet[];

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
