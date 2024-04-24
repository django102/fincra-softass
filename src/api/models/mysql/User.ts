import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "users" })
export default class User {
  @Column()
  @PrimaryGeneratedColumn()
    public id?: number;

  @Column()
  public email: string;
  
  @Column()
  public password: string;
  
  @Column()
  public firstName: string;
  
  @Column()
  public lastName: string;
  
  @Column()
  public phoneNumber: string;
  
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
}