import { Router } from "express";

import { UserTokenController } from "./userToken.controller";

const router = Router();

router.post("/use-token", UserTokenController.useToken);

export const UserTokenRoute = router;
