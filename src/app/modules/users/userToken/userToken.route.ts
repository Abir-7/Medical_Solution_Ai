import { Router } from "express";
import { auth } from "../../../middleware/auth/auth";

const router = Router();

router.get("/use-token", auth("USER"));
