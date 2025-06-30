import { IBaseUser } from "../user/user.interface";

export interface IUserProfile {
  fullName: string;

  dateOfBirth?: Date;
  phone?: string;
  address?: string;
  image?: string;
  user: IBaseUser;
  country: string;
  specialty: Specialty;
}

export enum Specialty {
  Cardiologist = "Cardiologist",
  Dermatologist = "Dermatologist",
  Neurologist = "Neurologist",
  Pediatrician = "Pediatrician",
  Orthopedist = "Orthopedist",
  GeneralPractitioner = "General Practitioner",
  Dentist = "Dentist",
  Surgeon = "Surgeon",
  Psychiatrist = "Psychiatrist",
  Radiologist = "Radiologist",
  // Add more specialties as needed
}
