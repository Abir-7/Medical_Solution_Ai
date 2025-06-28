import { Router } from "express";
import { UserRoute } from "../modules/users/user/user.route";
import { AuthRoute } from "../modules/auth/auth.route";
import { UserProfileRoute } from "../modules/users/userProfile/userProfile.route";
import { MedicalReportRoute } from "../modules/medicalReport/medicalReport.route";
import { TokenPackageRoute } from "../modules/TokenPackages/tokenPackages.route";

const router = Router();
const apiRoutes = [
  { path: "/user", route: UserRoute },
  { path: "/user", route: UserProfileRoute },
  { path: "/auth", route: AuthRoute },
  { path: "/ai", route: MedicalReportRoute },
  { path: "/token-package", route: TokenPackageRoute },
];
apiRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
