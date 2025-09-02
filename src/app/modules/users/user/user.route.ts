import { Router } from "express";
import { UserController } from "./user.controller";

import { auth } from "../../../middleware/auth/auth";

const router = Router();

router.get("/me", auth("USER", "ADMIN"), UserController.getMyData);
router.get("/my-token", auth("USER"), UserController.getMyToken);
router.post(
  "/check-my-token",

  UserController.checkUserTokenAvailability
);
router.delete("/delete-me", auth("USER"), UserController.deleteMe);
router.delete("/delete/:uId", auth("ADMIN"), UserController.deleteUser);

export const UserRoute = router;
