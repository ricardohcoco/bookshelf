export type LoginResponse = {
    message: string;
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
    }
}