"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_route_1 = require("../modules/users/user/user.route");
const auth_route_1 = require("../modules/auth/auth.route");
const userProfile_route_1 = require("../modules/users/userProfile/userProfile.route");
const tokenPackages_route_1 = require("../modules/TokenPackages/tokenPackages.route");
const payment_route_1 = require("../modules/payment/payment.route");
const medicalReport_route_1 = require("../modules/medicalReport/medicalReport.route");
const dashboard_route_1 = require("../modules/dashboard/dashboard.route");
const userToken_route_1 = require("../modules/users/userToken/userToken.route");
const router = (0, express_1.Router)();
const apiRoutes = [
    { path: "/user", route: user_route_1.UserRoute },
    { path: "/user", route: userProfile_route_1.UserProfileRoute },
    { path: "/user", route: userToken_route_1.UserTokenRoute },
    { path: "/auth", route: auth_route_1.AuthRoute },
    { path: "/ai", route: medicalReport_route_1.MedicalReportRoute },
    { path: "/token-package", route: tokenPackages_route_1.TokenPackageRoute },
    { path: "/payment", route: payment_route_1.PaymentRoute },
    { path: "/dashboard", route: dashboard_route_1.DashboardRoute },
];
apiRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
