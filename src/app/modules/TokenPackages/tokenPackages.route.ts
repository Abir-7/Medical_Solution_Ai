import { Router } from "express";

import { TokenPackageController } from "./tokenPackages.controller";
import { auth } from "../../middleware/auth/auth";

const router = Router();
router.post("/new", auth("ADMIN"), TokenPackageController.addNewPackage);
router.get("/", auth("ADMIN", "USER"), TokenPackageController.getAllPackage);

export const TokenPackageRoute = router;
