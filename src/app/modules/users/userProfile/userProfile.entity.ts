import { Entity, Column, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";

export enum Specialty {
  Cardiology = "Cardiology",
  Dermatology = "Dermatology",
  Neurology = "Neurology",
  Pediatrics = "Pediatrics",
  Orthopedics = "Orthopedics",
  Oncology = "Oncology",
  Psychiatry = "Psychiatry",
}

@Entity({ name: "user_profiles" })
export class UserProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  fullName!: string;

  // Correctly define the specialty column with enum type
  @Column({
    type: "enum",
    enum: Specialty,
    enumName: "specialty_enum",
    nullable: true,
  })
  specialty!: Specialty;

  @Column({ type: "date", nullable: true })
  dateOfBirth?: Date;

  @Column({ type: "varchar", nullable: true })
  phone?: string;

  @Column({ type: "varchar", nullable: true })
  address?: string;

  @Column({ type: "varchar" })
  country!: string;

  @Column({ type: "varchar", nullable: true })
  image?: string;

  @OneToOne(() => User, (user) => user.userProfile)
  user!: User;
}
