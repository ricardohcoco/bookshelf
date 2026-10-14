import { useState } from "react";
import { register } from "../../services/api";
import styles from "./Register.module.css";

type RegisterProps = {
  onGoToLogin: () => void;
};

export default function Register({ onGoToLogin }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Preencha todos os campos");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      setLoading(true);

      await register(name.trim(), email.trim(), password);

      setError("");
      onGoToLogin();
    } catch (error) {
      if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
        setError("Este e-mail já está cadastrado");
        return;
      }
      setError("Erro ao criar a conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <h1 className={styles.title}>Criar Conta</h1>

        <p className={styles.subtitle}>
          Cadastre-se para organizar sua estante
        </p>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
          aria-busy={loading}
        >
          <input
            className={styles.input}
            id="name"
            name="name"
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={loading}
            required
          />

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
            {loading ? "Criando..." : "Criar Conta"}
          </button>
        </form>

        <div className={styles.switch}>
          <span>Já possui uma conta?</span>
          <button className={styles.linkButton} onClick={onGoToLogin}>
            Entrar
          </button>
        </div>
      </section>
    </main>
  );
}
