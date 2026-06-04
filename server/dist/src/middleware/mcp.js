import { createMiddleware } from "hono/factory";
import { usersTable } from "../db/schema/user.js";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { verify } from "hono/jwt";
const db = drizzle(process.env.DB_FILE_NAME);
export const mcpAuth = createMiddleware(async (c, next) => {
    const auth = c.req.header("Authorization");
    if (!auth || !auth.startsWith("Bearer")) {
        return c.json({ error: "unauthorized" }, 401);
    }
    const token = auth.slice("Bearer ".length);
    const secret = process.env.COOKIE_KEY;
    if (!secret)
        process.exit(1);
    try {
        const decodedPayload = await verify(token, secret, "HS256");
        if (decodedPayload.type !== "mcp") {
            return c.json({ error: "unauthorized" }, 401);
        }
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
            c.set("mcpUser", userinfo);
        }
    }
    catch {
        return c.json({ error: "unauthorized" }, 401);
    }
    await next();
});
