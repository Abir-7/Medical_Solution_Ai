import { Router } from "express";
import { auth } from "../../../middleware/auth/auth";

const router = Router();

router.post("/use-token", auth("USER"));
