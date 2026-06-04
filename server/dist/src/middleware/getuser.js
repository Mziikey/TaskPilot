import { createMiddleware } from "hono/factory";
import { usersTable } from "../db/schema/user.js";
import { drizzle } from "drizzle-orm/libsql";
import { deleteCookie, getCookie } from "hono/cookie";
import { eq } from "drizzle-orm";
import { verify } from "hono/jwt";
const db = drizzle(process.env.DB_FILE_NAME);
export const getUser = createMiddleware(async (c, next) => {
    const jwtToken = getCookie(c, "access_token");
    if (!jwtToken) {
        await next();
        return;
    }
    const secret = process.env.COOKIE_KEY;
    if (!secret)
        process.exit(1);
    try {
        const decodedPayload = await verify(jwtToken, secret, "HS256");
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
    }
    catch {
        deleteCookie(c, "access_token");
    }
    await next();
});
