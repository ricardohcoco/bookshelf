import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import jwt from "jsonwebtoken";
import connection from "../src/database/connection.ts";
import { env } from "../src/config/env.ts";
import userRoutes from "../src/routes/userRoutes.ts";
import bookRoutes from "../src/routes/bookRoutes.ts";

test("account authorization, safe responses and book validation", async () => {
  const originalQuery = connection.query;
  const queries = [];
  connection.query = async (sql, values) => {
    queries.push({ sql, values });
    if (sql.startsWith("SELECT"))
      return [[{ id: 7, name: "Test", email: "test@example.com" }]];
    return [{ insertId: 42, affectedRows: 1 }];
  };
  const app = express();
  app.use(express.json());
  app.use("/users", userRoutes);
  app.use("/books", bookRoutes);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const token = jwt.sign({ id: 7, email: "test@example.com" }, env.jwtSecret);
  async function request(path, method = "GET", body, authenticated = true) {
    return fetch(base + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(authenticated ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  }
  try {
    for (const [path, method] of [
      ["/users/me", "GET"],
      ["/users/7", "GET"],
      ["/users/7", "PUT"],
      ["/users/7", "DELETE"],
    ]) {
      assert.equal((await request("/users")).status, 404);
      assert.equal((await request(path, method, undefined, false)).status, 401);
    }
    for (const method of ["GET", "PUT", "DELETE"]) {
      assert.equal((await request("/users/8", method)).status, 403);
    }
    assert.equal(
      queries.length,
      0,
      "unauthorized requests must not reach the database",
    );
    const response = await request("/users/me");

    assert.equal(response.status, 200);

    const user = await response.json();

    assert.equal(Object.hasOwn(user, "password"), false);

    assert.equal(
      queries.at(-1).sql,
      "SELECT id, name, email FROM users WHERE id = ?",
    );

    assert.deepEqual(queries.at(-1).values, [7]);
    const ownAccount = await request("/users/7");
    assert.equal(ownAccount.status, 200);
    const beforeInvalid = queries.length;
    for (const invalid of [
      undefined,
      null,
      {},
      { title: 123, author: "Author" },
      { title: "Title", author: [] },
      { title: "  ", author: "Author" },
      { title: "Title", author: "  " },
    ]) {
      assert.equal((await request("/books", "POST", invalid)).status, 400);
      assert.equal(
        (
          await request(
            "/books/42",
            "PUT",
            invalid == null ? invalid : { ...invalid, readed: false },
          )
        ).status,
        400,
      );
    }
    assert.equal(queries.length, beforeInvalid);
    const created = await request("/books", "POST", {
      title: " Title ",
      author: " Author ",
    });
    assert.equal(created.status, 201);
    assert.deepEqual(await created.json(), {
      id: 42,
      title: "Title",
      author: "Author",
      readed: false,
      reading: false,
    });
    assert.deepEqual(queries.at(-1).values, ["Title", "Author", 7]);
    assert.equal(
      (
        await request("/books/42", "PUT", {
          title: "Title",
          author: "Author",
          readed: true,
          reading: true,
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await request("/books/42", "PUT", {
          title: " Title ",
          author: " Author ",
          readed: false,
          reading: true,
        })
      ).status,
      200,
    );
    assert.deepEqual(queries.at(-1).values, [
      "Title",
      "Author",
      false,
      true,
      "42",
      7,
    ]);
  } finally {
    connection.query = originalQuery;
    await new Promise((resolve) => server.close(resolve));
    await connection.end();
  }
});
