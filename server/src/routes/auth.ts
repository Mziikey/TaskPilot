import { Hono } from "hono";
import { usersTable } from "../db/schema/user.js";
import * as argon2 from "argon2";
import { deleteCookie, generateCookie } from "hono/cookie";
import { eq } from "drizzle-orm";
import type { dbType } from "../index.js";
import { sign } from "hono/jwt";

export type UserInfo = {
  id: number;
  username: string;
};

export type RegisterInfo = {
  username: string;
  nickname: string;
  password: string;
};

export type PayloadType = {
  userId: number;
  username: string;
  exp: number;
};

export type MCPPayloadType = {
  userId: number;
  username: string;
  type: "mcp";
  exp: number;
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

      const payload: PayloadType = {
        userId: id,
        username: body.username,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1day 过期
      };

      const secret = process.env.COOKIE_KEY;
      if (!secret) process.exit(1);

      const token = await sign(payload, secret);

      const newCookie = generateCookie("access_token", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24,
      });

      c.header("Set-Cookie", newCookie);

      return c.json({ userId: id, username: body.username });
    } else return new Response(JSON.stringify({ error: "password" }), { status: 400 });
  }
});

authApp.get("/mcp-token", async (c) => {
  const db = c.get("db");
  const userId = c.get("user")?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  const payload: MCPPayloadType = {
    userId: user.id,
    username: user.username,
    type: "mcp",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30day 过期
  };

  const secret = process.env.COOKIE_KEY;
  if (!secret) process.exit(1);

  const token = await sign(payload, secret);

  return c.json(token);
});

authApp.post("/logout", async (c) => {
  const user = c.get("user");
  deleteCookie(c, "access_token");
  return c.json(user);
});

authApp.get("/me", async (c) => {
  const info = c.get("user");
  return c.json(info);
});

authApp.post("/register", async (c) => {
  const body: RegisterInfo = await c.req.json();
  const db = c.get("db");
  const isExisted = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, body.username));

  if (isExisted.length > 0) {
    return new Response(JSON.stringify({ error: "isExisted" }), { status: 400 });
  }

  const user: typeof usersTable.$inferInsert = {
    username: body.username,
    passwordHash: await argon2.hash(body.password),
    nickname: body.nickname,
  };

  await db.insert(usersTable).values(user);
  console.log("user inserted");
  return c.json({ username: body.username });
});

export default authApp;
