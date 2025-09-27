import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { auth } from "../../middleware/auth/auth";
//import { auth } from "../../middleware/auth/auth";

const router = Router();

router.get("/", DashboardController.dashboardData);
router.get("/user-list", DashboardController.userList);
router.get("/token-data", DashboardController.tokenData);
router.post("/add-terms", auth("ADMIN"), DashboardController.addTerms);
router.get("/get-terms", DashboardController.getTerms);
router.post("/add-privacy", auth("ADMIN"), DashboardController.addPrivacy);
router.get("/get-privacy", DashboardController.getPrivacy);

export const DashboardRoute = router;
