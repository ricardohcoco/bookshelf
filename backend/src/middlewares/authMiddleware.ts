import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";

interface TokenPayload extends JwtPayload {
    id: number;
    email: string;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token não informado",
    });
  }

  const [scheme, token, extra] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token || extra) {
    return res.status(401).json({
      message: "Formato de autorização inválido",
    });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret, {
      algorithms: ["HS256"],
    });

    if (
      typeof decoded === "string" ||
      typeof decoded.id !== "number" ||
      !Number.isSafeInteger(decoded.id) ||
      decoded.id <= 0 ||
      typeof decoded.email !== "string"
    ) {
      return res.status(401).json({
        message: "Token inválido",
      });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Token inválido ou expirado",
    });
  }
}

export function requireOwnAccount(req: Request, res: Response, next: NextFunction) {
  if (Number(req.params.id) !== req.user?.id) {
    return res
      .status(403)
      .json({ message: "Acesso permitido apenas à própria conta" });
  }
  next();
}