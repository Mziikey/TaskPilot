import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { tasksTable, usersTable } from "./db/schema.js";
import { eq, lt, gte, ne } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import * as argon2 from "argon2";
import { deleteCookie, getCookie, generateCookie } from "hono/cookie";

const db = drizzle(process.env.DB_FILE_NAME!);

type UserInfo = {
  id: number;
  username: string;
};

const app = new Hono<{ Variables: { user: UserInfo | undefined } }>();

const logger = createMiddleware(async (c, next) => {
  console.log(`start its ${c.req.url} and ${c.req.method}`);
  const start = Date.now();
  console.log("---------------------------------");

  try {
    const body = await c.req.json();
    console.log(body);
    console.log("---------------------------------");
  } catch (e) {
    console.log("no body");
    console.log("---------------------------------");
  }

  const allcookies = c.req.header().cookie;
  console.log(allcookies);
  console.log("---------------------------------");

  await next();

  const end = Date.now();
  console.log(`end its ${c.req.url} and ${c.req.method} time ${end - start}ms`);
});

const getuser = createMiddleware(async (c, next) => {
  const thisuserId = getCookie(c, "userId");
  if (thisuserId) {
    const alluserinfo = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, Number(thisuserId)));

    const userinfo = {
      id: alluserinfo[0].id,
      username: alluserinfo[0].username,
    };
    c.set("user", userinfo);
  }

  await next();
});

app.use(logger);
app.use(getuser);

app.get("/tasks", async (c) => {
  const tt = await db.select().from(tasksTable);
  return c.json(tt);
});

app.get("/tasks/:taskId", async (c) => {
  const taskId = Number(c.req.param("taskId"));
  const task = await db.select().from(tasksTable).where(eq(tasksTable.id, taskId));
  return c.json(task);
});

app.get("/users/:userId", async (c) => {
  const userId = Number(c.req.param("userId"));
  const user = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  return c.json(user);
});

app.post("/auth/login", async (c) => {
  const body = await c.req.json();

  if (body.username && body.password) {
    const passwordHash = await db
      .select({ password: usersTable.passwordHash })
      .from(usersTable)
      .where(eq(usersTable.username, body.username));

    if (
      passwordHash.length !== 0 &&
      (await argon2.verify(passwordHash[0].password, body.password))
    ) {
      const userId = await db
        .select({ userId: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.username, body.username));
      const id = userId[0].userId;
      const newCookie = generateCookie("userId", String(id));
      c.header("Set-Cookie", newCookie);

      return c.json({ userId: id, username: body.username });
    } else return new Response(null, { status: 400 });
  }
});

app.post("/auth/logout", async (c) => {
  const dc = deleteCookie(c, "userId");
  return c.json({ userId: dc });
});

app.get("/auth/me", async (c) => {
  const info = c.get("user");
  console.log(info);
  return c.json(info);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
