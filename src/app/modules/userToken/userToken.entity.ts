import { User } from "./../users/user/user.entity";
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "userToken" })
export class UserToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "int", default: 0 })
  token!: number;

  @OneToOne(() => User, (user) => user.userToken)
  user!: User;
}
