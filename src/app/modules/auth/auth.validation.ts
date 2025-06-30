import { z } from "zod";
import { Specialty } from "../users/userProfile/userProfile.interface";

export const zodCreateUserSchema = z.object({
  body: z
    .object({
      fullName: z.string(),
      email: z.string().email(),
      password: z.string(),
      country: z.string(),
      specialty: z.nativeEnum(Specialty),
    })
    .strict(),
});
