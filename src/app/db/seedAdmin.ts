import { userRoles } from "../middlewares/auth/auth.interface";

import { User } from "../modules/users/user/user.entity";
import { UserAuthentication } from "../modules/users/userAuthentication/user_authentication.entity";
import { Specialty } from "../modules/users/userProfile/userProfile.entity";
import getHashedPassword from "../utils/helper/getHashedPassword";
import logger from "../utils/logger";
import { myDataSource } from "./database";

export async function seedAdmin() {
  const adminData = {
    email: "admin@example.com",
    password: await getHashedPassword("admin123"),
    role: userRoles.SUPERADMIN,
    isVerified: true,
    needToResetPass: false,
  };

  try {
    await myDataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);

      // 1. Check if any admin exists already
      const existingAdmin = await userRepo.findOne({
        where: { role: adminData.role },
      });

      if (existingAdmin) {
        logger.info("Admin user already exists, skipping seed.");
        return;
      }

      // 2. Create admin user
      const adminUser = userRepo.create({
        ...adminData,
        userProfile: {
          fullName: "ADMIN-1",
          phone: "01795377643",
          specialty: Specialty.Cardiology,
          country: "N/A",
        },
        authentication: {
          otp: null,
          expDate: null,
          token: null,
        },
      });

      // 4. Save with cascading profile
      await userRepo.save(adminUser);
      logger.info("Admin user seeded successfully!");
    });
  } catch (err) {
    logger.error(err);
  }
}
