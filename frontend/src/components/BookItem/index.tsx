import {
  bookStatusLabels,
  getBookStatus,
  type Book,
  type BookStatus,
} from "../../types/book";
import styles from "./BookItem.module.css";

type BookItemProps = {
  book: Book;
  loading: boolean;
  onEdit: (book: Book) => void;
  onChangeStatus: (book: Book, status: BookStatus) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
};

export default function BookItem({
  book,
  loading,
  onEdit,
  onChangeStatus,
  onDelete,
}: BookItemProps) {
  function handleDelete() {
    if (loading) return;

    if (window.confirm(`Deseja excluir o livro "${book.title}"?`)) {
      void onDelete(book.id);
    }
  }

  return (
    <li className={styles.card}>
      <h3 className={styles.title}>{book.title}</h3>
      <p className={styles.author}>{book.author}</p>
      <p className={styles.status}>{bookStatusLabels[getBookStatus(book)]}</p>
      <div className={styles.actions}>
        <select
          className={styles.statusSelect}
          aria-label={`Status de leitura de ${book.title}`}
          value={getBookStatus(book)}
          onChange={(event) =>
            void onChangeStatus(book, event.target.value as BookStatus)
          }
          disabled={loading}
        >
          {Object.entries(bookStatusLabels).map(([status, label]) => (
            <option key={status} value={status}>
              {label}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => onEdit(book)} disabled={loading}>
          Editar
        </button>
        <button
          className={styles.deleteButton}
          type="button"
          onClick={handleDelete}
          disabled={loading}
        >
          Excluir
        </button>
      </div>
    </li>
  );
}
