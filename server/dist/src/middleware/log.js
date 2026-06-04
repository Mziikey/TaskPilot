import { createMiddleware } from "hono/factory";
export const logger = createMiddleware(async (c, next) => {
    console.log(`start its ${c.req.url} and ${c.req.method}`);
    const start = Date.now();
    console.log("---------------------------------");
    try {
        const body = await c.req.json();
        console.log(body);
        console.log("---------------------------------");
    }
    catch (e) {
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
