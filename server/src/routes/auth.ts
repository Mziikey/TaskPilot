import { Hono } from "hono";
import { usersTable } from "../db/schema.js";
import * as argon2 from "argon2";
import { deleteCookie, generateCookie } from "hono/cookie";
import { eq } from "drizzle-orm";
import type { dbType } from "../index.js";

export type UserInfo = {
  id: number;
  username: string;
};

const authApp = new Hono<{ Variables: { user: UserInfo | undefined; db: dbType } }>();

authApp.post("/login", async (c) => {
  const body = await c.req.json();
  const db = c.get("db");

  if (body.username && body.password) {
    const passwordHash = await db
      .select({ password: usersTable.passwordHash })
      .from(usersTable)
      .where(eq(usersTable.username, body.username));
    if (passwordHash.length === 0) {
      return new Response(JSON.stringify({ error: "userName" }), { status: 400 });
    }

    if (await argon2.verify(passwordHash[0].password, body.password)) {
      const userId = await db
        .select({ userId: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.username, body.username));
      const id = userId[0].userId;
      const newCookie = generateCookie("userId", String(id));
      c.header("Set-Cookie", newCookie);

      return c.json({ userId: id, username: body.username });
    } else return new Response(JSON.stringify({ error: "password" }), { status: 400 });
  }
});

authApp.post("/logout", async (c) => {
  const dc = deleteCookie(c, "userId");
  return c.json({ userId: dc });
});

authApp.get("/me", async (c) => {
  const info = c.get("user");
  return c.json(info);
});

export default authApp;
