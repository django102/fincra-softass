import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import User from "./User";

@Entity({ name: "wallets" })
export default class Wallet {
  @Column()
  @PrimaryGeneratedColumn()
    public id?: number;

  @Column()
  public userId: number;

  @Column()
  public accountNumber: string;
  
  @Column({
      default: true,
  })
  public isActive?: boolean;
  
  @Column({
      type: "timestamp",
      default: /* istanbul ignore next: no way to wrap unit tests for this */ () => "CURRENT_TIMESTAMP"
  })
  public createdAt?: Date;
  
  @Column({
      type: "timestamp",
      nullable: true
  })
  public updatedAt?: Date;

  @ManyToOne(() => User)
  public user?: User;
}