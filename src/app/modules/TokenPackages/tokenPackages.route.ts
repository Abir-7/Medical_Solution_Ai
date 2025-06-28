import { Router } from "express";
import { auth } from "../../middlewares/auth/auth";
import { TokenPackageController } from "./tokenPackages.controller";

const router = Router();
router.post("/new", auth("SUPERADMIN"), TokenPackageController.addNewPackage);
router.get("/", auth("SUPERADMIN"), TokenPackageController.getAllPackage);

export const TokenPackageRoute = router;
