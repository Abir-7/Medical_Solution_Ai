import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TokenPackage } from "../TokenPackages/tokenPackages.entity";
import { UserToken } from "../userToken/userToken.entity";

@Entity({ name: "payment" })
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;
  @Column({ type: "varchar", nullable: true })
  txId!: string;
  @Column({ type: "float" })
  priceAtBuyTime!: number;
  @ManyToOne(() => TokenPackage, (tokenPackage) => tokenPackage.paymentData)
  @JoinColumn()
  tokenPackageId!: TokenPackage;
  @ManyToOne(() => UserToken, (userToken) => userToken.paymentData)
  @JoinColumn()
  userTokenId!: UserToken;
}
