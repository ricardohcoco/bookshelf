import type { RowDataPacket } from "mysql2";
import type { Request, Response } from "express";
import connection from "../database/connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

interface User extends RowDataPacket {
    id: number;
    name: string;
    email: string;
    password: string;
}

export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "E-mail e senha são obrigatórios",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const [users] = await connection.query<User[]>(
            "SELECT * FROM users WHERE email = ?",
            [normalizedEmail],
        );

        const user = users[0];

        if (!user) {
            return res.status(401).json({
                message: "E-mail ou senha inválidos",
            });
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return res.status(401).json({
                message: "E-mail ou senha inválidos",
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
            },
            env.jwtSecret,
            {
                expiresIn: "8h",
            },
        );

        res.json({
            message: "Login realizado com sucesso!",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch {
        res.status(500).json({
            message: "Erro interno do servidor",
        });
    }
}