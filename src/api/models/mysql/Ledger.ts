import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { TransactionType } from "../../../api/enums/TransactionType";


@Entity({ name: "ledger" })
export default class Ledger {
  @Column()
  @PrimaryGeneratedColumn()
    public id?: number;

  @Column()
  public reference: string;

  @Column()
  public accountNumber: string;

  @Column("enum", {
      enum: TransactionType,
      nullable: false,
  })
  public transactionType: TransactionType;
  
  @Column({
      default: 0.00,
  })
  public credit?: number;

  @Column({
      default: 0.00,
  })
  public debit?: number;
 
  @Column({
      default: true,
  })
  public isReversed?: boolean;

  @Column({
      default: true,
  })
  public isDeleted?: boolean;
  
  @Column({
      type: "timestamp",
      default: /* istanbul ignore next: no way to wrap unit tests for this */ () => "CURRENT_TIMESTAMP"
  })
  public transactionDate?: Date;
}