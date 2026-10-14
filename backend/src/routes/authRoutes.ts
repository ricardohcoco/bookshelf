import { Router } from "express";
import { login } from "../controllers/authController.js";
import { loginLimiter } from "../middlewares/loginLimiter.js";

const authRoutes = Router();

authRoutes.post("/login", loginLimiter, login);

export default authRoutes;