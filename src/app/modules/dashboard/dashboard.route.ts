import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
//import { auth } from "../../middleware/auth/auth";

const router = Router();

router.get("/", DashboardController.dashboardData);
router.get("/user-list", DashboardController.userList);
router.get("/token-data", DashboardController.tokenData);
router.post("/add-terms", DashboardController.addTerms);
export const DashboardRoute = router;
