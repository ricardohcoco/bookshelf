import connection from "../database/connection.js";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import type { QueryError, ResultSetHeader, RowDataPacket } from "mysql2";

export async function getUsers(req: Request, res:Response) {
    try {
        const [users] = await connection.query(
            "SELECT id, name, email FROM users WHERE id = ?",
            [req.user?.id],
        );
        return res.json(users);
    } catch {
        return res.status(500).json({
            message: "Erro interno do servidor"
        })
    }
}

export async function getUserById(req: Request, res:Response) {
    try {
        const { id } = req.params;
        const [users] = await connection.query(
            "SELECT id, name, email FROM users WHERE id = ?",
            [id],
        );

        const userList = users as any[];

        if (userList.length === 0) {
            return res.status(404).json({
                message: "Usuário não encontrado"
            });
        }

        res.json(userList[0]);
    } catch {
        res.status(500).json({
            message: "Erro interno do servidor",
        })
    }
}

export async function createUser(req: Request, res: Response) {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Dados inválidos",
            });
        }

        if (!name.trim() || !email.trim() || !password.trim()) {
            return res.status(400).json({
                message: "Nome, e-mail e senha são obrigatórios",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "A senha deve ter pelo menos 6 caracteres",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const hashedPassword = await bcrypt.hash(password, 10);

        await connection.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name.trim(), normalizedEmail, hashedPassword],
        );

        res.status(201).json({
            message: "Usuário cadastrado com sucesso!"
        });
    } catch (error) {
        const mysqlError = error as QueryError;

        if (mysqlError.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "E-mail já cadastrado",
            });
        }

        res.status(500).json({
            message: "Erro interno do servidor",
        });
    }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { name, email } = req.body ?? {};

    if (!userId) {
      return res.status(401).json({
        message: "Usuário não autenticado",
      });
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      !name.trim() ||
      !email.trim()
    ) {
      return res.status(400).json({
        message: "Nome e e-mail válidos são obrigatórios",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [result] = await connection.query<ResultSetHeader>(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name.trim(), normalizedEmail, userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Usuário não encontrado",
      });
    }

    return res.json({
      message: "Usuário atualizado com sucesso!",
    });
  } catch (error) {
    const mysqlError = error as QueryError;

    if (mysqlError.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "E-mail já cadastrado",
      });
    }

    return res.status(500).json({
      message: "Erro interno do servidor",
    });
  }
}

export async function deleteUser(req: Request, res: Response) {
    try {
        const { id } = req.params;

        const [result] = await connection.query("DELETE from users WHERE id = ?", [id,]);

        const deleteResult = result as any;

        if (deleteResult.affectedRows === 0) {
            return res.status(400).json({
                message: "Usuário não encontrado",
            });
        }
        res.json({
            message: "Usuário excluído com sucesso!",
        });
    } catch {
        res.status(500).json({
            message: "Erro interno no servidor",
        });
    }
}

interface UserRow extends RowDataPacket {
    id: number;
    name: string;
    email: string;
}

export async function getCurrentUser(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Usuário não autenticado",
            });
        }

        const [users] = await connection.query<UserRow[]>(
            "SELECT id, name, email FROM users WHERE id = ?",
            [userId]
        );

        const user = users[0];

        if (!user) {
            return res.status(404).json({
                message: "Usuário não encontrado",
            });
        }

        return res.json(user);
    } catch {
        return res.status(500).json({
            message: "Erro interno do servidor",
        });
    }
}


