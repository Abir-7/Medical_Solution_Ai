import { Payment } from "./../payment/payment.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "tokenPackages" })
export class TokenPackage {
  @PrimaryGeneratedColumn("uuid")
  id!: string;
  @Column({ type: "float" })
  price!: number;
  @Column({ type: "int" })
  tokenAmount!: number;
  @OneToMany(() => Payment, (payment) => payment.tokenPackageId)
  paymentData!: Payment[];
}
