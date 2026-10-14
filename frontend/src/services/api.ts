import type { LoginResponse } from "../types/login";
import type { Book } from "../types/book";

const API_URL = import.meta.env.VITE_API_URL;

async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {},
) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    throw new Error("API_ERROR");
  }

  return response;
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (response.status === 401) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (!response.ok) {
    throw new Error("LOGIN_ERROR");
  }

  const data: LoginResponse = await response.json();

  return data;
}

export async function register(name: string, email: string, password: string) {
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  if (response.status === 409) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  if (!response.ok) {
    throw new Error("REGISTER_ERROR");
  }

  return response.json();
}

export async function getBooks(signal?: AbortSignal): Promise<Book[]> {
  const response = await authenticatedFetch("/books", { signal });
  return response.json();
}

export async function createBook(title: string, author: string): Promise<Book> {
  const response = await authenticatedFetch("/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, author }),
  });
  return response.json();
}

export async function updateBook(book: Book) {
  await authenticatedFetch(`/books/${book.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: book.title,
      author: book.author,
      readed: book.readed,
      reading: book.reading ?? false,
    }),
  });
}

export async function deleteBook(id: number) {
  await authenticatedFetch(`/books/${id}`, { method: "DELETE" });
}
