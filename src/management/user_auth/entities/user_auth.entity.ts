import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class UserLoginInformation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  status_id: number;
}

@Entity("users")
export class UserVerifyInformation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullname: string;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  status_id: number;
}

@Entity("users")
export class ChangePasswordInformation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  modified_date: Date;
}

@Entity("user_login")
export class UserLogin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ nullable: true })
  access_token: string;

  @Column()
  status_id: number;

  @Column({ type: "datetime", nullable: true })
  modified_date: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  created_date: Date;
}
