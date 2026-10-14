import { Router } from "express";
import {
  createUser,
  deleteUser,
  getCurrentUser,
  getUserById,
  updateUser,
} from "../controllers/userController.js";
import {
  authMiddleware,
  requireOwnAccount,
} from "../middlewares/authMiddleware.js";
import { registerLimiter } from "../middlewares/registerLimiter.js";

const userRoutes = Router();

userRoutes.post("/", registerLimiter, createUser);
userRoutes.use(authMiddleware);

userRoutes.get("/me", getCurrentUser);
userRoutes.get("/:id", requireOwnAccount, getUserById);
userRoutes.put("/:id", requireOwnAccount, updateUser);
userRoutes.delete("/:id", requireOwnAccount, deleteUser);

export default userRoutes;
