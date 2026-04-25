import { createMiddleware } from "hono/factory";
import { usersTable } from "../db/schema/user.js";
import { drizzle } from "drizzle-orm/libsql";
import { getCookie } from "hono/cookie";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DB_FILE_NAME!);

export const getUser = createMiddleware(async (c, next) => {
  const thisuserId = getCookie(c, "userId");
  if (!thisuserId) {
    await next();
    return;
  }

  if (thisuserId) {
    const alluserinfo = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, Number(thisuserId)));

    if (alluserinfo.length > 0) {
      const userinfo = {
        id: alluserinfo[0].id,
        username: alluserinfo[0].username,
      };
      c.set("user", userinfo);
    }
  }
  await next();
});
