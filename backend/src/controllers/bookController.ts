import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import connection from "../database/connection.js";

interface TaskRow extends RowDataPacket {
    id: number;
    title: string;
    author: string;
    readed: number;
    reading: number;
}

export async function getBook(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Usuário não autenticado"
            });
        }

        const [books] = await connection.query<TaskRow[]>(
            "SELECT id, title, author, readed, reading FROM books WHERE user_id = ?",
            [userId]
        );

        const formattedBooks = books.map((book) => ({
            id: book.id,
            title: book.title,
            author: book.author,
            readed: Boolean(book.readed),
            reading: !book.readed && Boolean(book.reading),
        }));

        res.json(formattedBooks);
    } catch {
        res.status(500).json({
            message: "Erro interno no servidor"
        });
    }
}

export async function newBook(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const { title, author } = req.body ?? {};

        if (typeof title !== "string" || typeof author !== "string" || !title.trim() || !author.trim()) {
            return res.status(400).json({
                message: "Título e autor são obrigatórios"
            });
        }

        if (!userId) {
            return res.status(401).json({
                message: "Usuário não autenticado",
            });
        }

        const [result] = await connection.query<ResultSetHeader>(
            "INSERT INTO books (title, author, user_id) VALUES (?, ?, ?)",
            [title.trim(), author.trim(), userId]
        );

        res.status(201).json({
            id: result.insertId,
            title: title.trim(),
            author: author.trim(),
            readed: false,
            reading: false,
        });
    } catch {
        res.status(500).json({
            message: "Erro interno do servidor"
        });
    }
}

export async function updateBook(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { title, author, readed, reading = false } = req.body ?? {};

        if (!userId) {
            return res.status(401).json({
                message: "Usuário não autenticado"
            });
        }

        if (typeof title !== "string" || typeof author !== "string" || !title.trim() || !author.trim() || typeof readed !== "boolean" || typeof reading !== "boolean" || (readed && reading)) {
            return res.status(400).json({
                message: "Título, autor e status são obrigatórios"
            });
        }

        const [result] = await connection.query<ResultSetHeader>(
            `
            UPDATE books
            SET title = ?, author = ?, readed = ?, reading = ?
            WHERE id = ? AND user_id = ?
            `,
            [title.trim(), author.trim(), readed, reading, id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Livro não encontrado"
            });
        }

        res.json({
            message: "Livro atualizado com sucesso!"
        });
    } catch {
        res.status(500).json({
            message: "Erro interno do servidor"
        });
    }
}

export async function deleteBook(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({
                message: "Usuário não autenticado"
            });
        }

        const [result] = await connection.query<ResultSetHeader>(
            `
            DELETE FROM books
            WHERE id = ? AND user_id = ? 
            `,
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Livro não encontrado"
            });
        }

        res.json({
            message: "Livro excluído com sucesso!"
        });
    } catch {
        res.status(500).json({
            message: "Erro interno do servidor"
        });
    }
}
