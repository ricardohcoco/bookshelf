import { rateLimit } from "express-rate-limit";

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Muitos cadastros realizados. Tente novamente mais tarde.",
  },
});