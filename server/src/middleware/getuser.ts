import { createMiddleware } from "hono/factory";
import { usersTable } from "../db/schema/user.js";
import { drizzle } from "drizzle-orm/libsql";
import { deleteCookie, getCookie } from "hono/cookie";
import { eq } from "drizzle-orm";
import { verify } from "hono/jwt";

const db = drizzle(process.env.DB_FILE_NAME!);

export const getUser = createMiddleware(async (c, next) => {
  const jwtToken = getCookie(c, "access_token");
  if (!jwtToken) {
    await next();
    return;
  }
  const secretKey = "mySecretKey";

  try {
    const decodedPayload = await verify(jwtToken, secretKey, "HS256");
    console.log(decodedPayload);

    const thisuserId = decodedPayload.userId;

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
  } catch {
    deleteCookie(c, "access_token", {
      path: "/",
    });
  }
  await next();
});
