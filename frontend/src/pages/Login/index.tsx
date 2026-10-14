import { useState } from "react";
import styles from "./Login.module.css";
import { login } from "../../services/api";

type LoginProps = {
  onLogin: () => void;
  onGoToRegister: () => void;
};

export default function Login({ onLogin, onGoToRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const data = await login(email.trim(), password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      setError(
        error instanceof Error && error.message === "INVALID_CREDENTIALS"
          ? "E-mail ou senha inválidos."
          : "Não foi possível entrar. Tente novamente.",
      );
      return;
    } finally {
      setLoading(false);
    }

    onLogin();
  }

  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <h1 className={styles.title}>Bookshelf</h1>
        <p className={styles.subtitle}>
          Entre para acessar sua estante de livros
        </p>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
          aria-busy={loading}
        >
          <div className={styles.field}>
            <input
              className={styles.input}
              id="email"
              name="email"
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className={styles.field}>
            <input
              className={styles.input}
              id="password"
              name="password"
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              required
            />
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button
            className={styles.submitButton}
            type="submit"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className={styles.register}>
          Ainda não tem uma conta?{" "}
          <button
            className={styles.registerButton}
            type="button"
            onClick={onGoToRegister}
            disabled={loading}
          >
            Cadastre-se
          </button>
        </p>
      </section>
    </main>
  );
}
