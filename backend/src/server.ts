import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import type { ErrorRequestHandler } from "express";
import { env } from "./config/env.js";


const app = express();

app.set("trust proxy", 1);

app.use(cors({
    origin: env.frontendUrl,
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "API funcionando!" })
});

app.use("/users", userRoutes);

app.use(authRoutes);

app.use("/books", bookRoutes);

const jsonErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      message: "JSON inválido",
    });
    return;
  }

  next(err);
};

app.use(jsonErrorHandler);

app.listen(env.port, () => {
    console.log(`Servidor rodando na porta ${env.port}.`)
})