import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { deleteBook, getBook, newBook, updateBook } from "../controllers/bookController.js";

const bookRoutes = Router();

bookRoutes.get("/", authMiddleware, getBook);
bookRoutes.post("/", authMiddleware, newBook);
bookRoutes.put("/:id", authMiddleware, updateBook);
bookRoutes.delete("/:id", authMiddleware, deleteBook);

export default bookRoutes;