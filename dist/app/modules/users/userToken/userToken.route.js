"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTokenRoute = void 0;
const express_1 = require("express");
const userToken_controller_1 = require("./userToken.controller");
const router = (0, express_1.Router)();
router.post("/use-token", userToken_controller_1.UserTokenController.useToken);
exports.UserTokenRoute = router;
