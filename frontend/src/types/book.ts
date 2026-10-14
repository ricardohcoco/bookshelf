export type Book = {
    id: number;
    title: string;
    author: string;
    readed: boolean;
    reading?: boolean;
}

export type BookStatus = "read" | "reading" | "next";

export function getBookStatus(book: Book): BookStatus {
    return book.readed ? "read" : book.reading ? "reading" : "next";
}

export const bookStatusLabels: Record<BookStatus, string> = {
    read: "Lidos",
    reading: "Lendo",
    next: "Próximas Leituras",
};
