import { useState } from "react";
import type { Book } from "../../types/book";
import styles from "./BookForm.module.css";

type BookFormProps = {
  book: Book | null;
  loading: boolean;
  onSave: (title: string, author: string) => Promise<boolean>;
  onCancel: () => void;
};

export default function BookForm({
  book,
  loading,
  onSave,
  onCancel,
}: BookFormProps) {
  const [title, setTitle] = useState(book?.title ?? "");
  const [author, setAuthor] = useState(book?.author ?? "");
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    if (loading) return;

    if (!title.trim() || !author.trim()) {
      setError("Preencha o título e o autor.");
      return;
    }

    setError("");
    const success = await onSave(title.trim(), author.trim());
    if (success && !book) {
      setTitle("");
      setAuthor("");
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-busy={loading}>
      <h2>{book ? "Editar livro" : "Adicionar livro"}</h2>
      <div className={styles.field}>
        <label htmlFor="book-title">Título</label>
        <input
          className={styles.input}
          id="book-title"
          name="title"
          type="text"
          placeholder="Título do livro"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={loading}
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="book-author">Autor</label>
        <input
          className={styles.input}
          id="book-author"
          name="author"
          type="text"
          placeholder="Nome do autor"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          disabled={loading}
          required
        />
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <button
          className={styles.submitButton}
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Salvando..."
            : book
              ? "Salvar alterações"
              : "Adicionar livro"}
        </button>
        {book && (
          <button type="button" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
