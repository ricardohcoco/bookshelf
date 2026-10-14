import { useCallback, useEffect, useRef, useState } from "react";
import { createBook, deleteBook, getBooks, updateBook } from "../services/api";
import type { Book, BookStatus } from "../types/book";

export default function useBooks(onLogout: () => void) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const mutationPending = useRef(false);

  const handleError = useCallback(
    (error: unknown, message: string) => {
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        onLogout();
        return;
      }
      setError(message);
    },
    [onLogout],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadBooks() {
      try {
        const data = await getBooks(controller.signal);
        if (!controller.signal.aborted) setBooks(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          handleError(error, "Não foi possível carregar os livros.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadBooks();
    return () => controller.abort();
  }, [handleError]);

  async function reloadBooks() {
    setLoading(true);
    setError("");
    try {
      setBooks(await getBooks());
    } catch (error) {
      handleError(
        error,
        "Não foi possível atualizar a lista. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function runMutation(action: () => Promise<void>, message: string) {
    if (mutationPending.current) return false;

    mutationPending.current = true;
    setSaving(true);
    setError("");
    try {
      await action();
      return true;
    } catch (error) {
      handleError(error, message);
      return false;
    } finally {
      mutationPending.current = false;
      setSaving(false);
    }
  }

  async function saveBook(title: string, author: string) {
    return runMutation(async () => {
      if (editingBook) {
        const updatedBook = { ...editingBook, title, author };
        await updateBook(updatedBook);
        setBooks((current) =>
          current.map((book) =>
            book.id === updatedBook.id ? updatedBook : book,
          ),
        );
        setEditingBook(null);
      } else {
        const newBook = await createBook(title, author);
        setBooks((current) => [...current, newBook]);
      }
    }, "Não foi possível salvar o livro.");
  }

  async function changeStatus(book: Book, status: BookStatus) {
    return runMutation(async () => {
      const updatedBook = { ...book, readed: status === "read", reading: status === "reading" };
      await updateBook(updatedBook);
      setBooks((current) =>
        current.map((item) =>
          item.id === updatedBook.id ? updatedBook : item,
        ),
      );
    }, "Não foi possível atualizar o status de leitura.");
  }

  async function removeBook(id: number) {
    return runMutation(async () => {
      await deleteBook(id);
      setBooks((current) => current.filter((book) => book.id !== id));
      if (editingBook?.id === id) setEditingBook(null);
    }, "Não foi possível excluir o livro.");
  }

  return {
    books,
    loading,
    saving,
    error,
    editingBook,
    saveBook,
    changeStatus,
    removeBook,
    reloadBooks,
    startEditing: setEditingBook,
    cancelEditing: () => setEditingBook(null),
  };
}
