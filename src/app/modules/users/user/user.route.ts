import { Router } from "express";
import { UserController } from "./user.controller";

const router = Router();
router.get("/all", UserController.getAllUser);
export const UserRoute = router;
