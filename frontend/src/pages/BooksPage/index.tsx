import { useState } from "react";
import {
  bookStatusLabels,
  getBookStatus,
  type BookStatus,
} from "../../types/book";
import styles from "./BooksPage.module.css";
import BookForm from "../../components/BookForm";
import BookItem from "../../components/BookItem";
import useBooks from "../../hook/useBooks";

type BooksPageProps = {
  onLogout: () => void;
};

export default function BooksPage({ onLogout }: BooksPageProps) {
  const [userName] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") ?? "null");
      return typeof user?.name === "string" ? user.name.trim() : "";
    } catch {
      return "";
    }
  });
  const {
    books,
    loading,
    saving,
    error,
    editingBook,
    saveBook,
    changeStatus,
    removeBook,
    reloadBooks,
    startEditing,
    cancelEditing,
  } = useBooks(onLogout);
  const [filter, setFilter] = useState<BookStatus | null>(null);
  const filteredBooks = books.filter(
    (book) => filter === null || getBookStatus(book) === filter,
  );

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Bookshelf</h1>
          <p className={styles.subtitle}>Organize sua estante de livros</p>
          <p className={styles.greeting}>
            {userName ? `Olá, ${userName}!` : "Olá!"}
          </p>
        </div>
        <button
          className={styles.logoutButton}
          type="button"
          onClick={onLogout}
        >
          Sair
        </button>
      </header>

      <BookForm
        key={editingBook?.id ?? "new"}
        book={editingBook}
        loading={loading || saving}
        onSave={saveBook}
        onCancel={cancelEditing}
      />

      {error && (
        <div className={styles.error} role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={reloadBooks}
            disabled={loading || saving}
          >
            Atualizar lista
          </button>
        </div>
      )}

      <section
        className={styles.books}
        aria-labelledby="books-title"
        aria-busy={loading}
      >
        <h2 id="books-title">Minha estante</h2>
        <div
          className={styles.filters}
          role="group"
          aria-label="Filtrar livros por status"
        >
          {Object.entries(bookStatusLabels).map(([status, label]) => (
            <button
              key={status}
              type="button"
              className={styles.filterButton}
              aria-pressed={filter === status}
              onClick={() =>
                setFilter(filter === status ? null : (status as BookStatus))
              }
            >
              {label} (
              {books.filter((book) => getBookStatus(book) === status).length})
            </button>
          ))}
        </div>
        {loading ? (
          <p role="status">Carregando livros...</p>
        ) : books.length === 0 ? (
          !error && (
            <p>
              Você ainda não tem livros na estante. Adicione seu primeiro livro!
            </p>
          )
        ) : (
          <>
            <p className={styles.subtitle}>
              {filteredBooks.length} de {books.length} livro(s)
            </p>
            {filteredBooks.length === 0 && (
              <p role="status">
                Nenhum livro em “
                {filter ? bookStatusLabels[filter] : "Minha estante"}”.
              </p>
            )}
            <ul className={styles.list}>
              {filteredBooks.map((book) => (
                <BookItem
                  key={book.id}
                  book={book}
                  loading={saving || editingBook !== null}
                  onEdit={startEditing}
                  onChangeStatus={changeStatus}
                  onDelete={removeBook}
                />
              ))}
            </ul>
          </>
        )}
      </section>
    </main>
  );
}
