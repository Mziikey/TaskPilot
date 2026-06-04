import { Hono } from "hono";
import { tasksTable } from "../db/schema/task.js";
import { and, eq } from "drizzle-orm";
const tasksApp = new Hono();
tasksApp.get("/", async (c) => {
    const db = c.get("db");
    const userId = c.get("user")?.id;
    if (!userId) {
        return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    }
    const response = await db.select().from(tasksTable).where(eq(tasksTable.userId, userId));
    return c.json(response);
});
tasksApp.post("/add", async (c) => {
    const db = c.get("db");
    const userId = c.get("user")?.id;
    if (!userId) {
        return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    }
    const body = await c.req.json();
    const task = { ...body, userId: userId };
    await db.insert(tasksTable).values(task);
    console.log("task inserted");
    return c.json({ task: body.title });
});
tasksApp.post("/add/batch", async (c) => {
    const db = c.get("db");
    const userId = c.get("user")?.id;
    if (!userId) {
        return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    }
    const body = await c.req.json();
    const tasks = body.map((task) => ({ ...task, userId: userId }));
    await db.insert(tasksTable).values(tasks.map((t) => t));
    console.log("task inserted");
    return c.json(tasks.map((t) => t.title));
});
tasksApp.delete("/delete/:id", async (c) => {
    const db = c.get("db");
    const taskId = c.req.param("id");
    const userId = c.get("user")?.id;
    if (!userId) {
        return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    }
    await db
        .delete(tasksTable)
        .where(and(eq(tasksTable.id, Number(taskId)), eq(tasksTable.userId, userId)));
    return c.json({ taskId: taskId });
});
tasksApp.post("/complete/:id", async (c) => {
    const db = c.get("db");
    const taskId = c.req.param("id");
    const userId = c.get("user")?.id;
    if (!userId) {
        return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    }
    await db
        .update(tasksTable)
        .set({ status: "done" })
        .where(and(eq(tasksTable.id, Number(taskId)), eq(tasksTable.userId, userId)));
    return c.json({ taskId: Number(taskId), status: "done" });
});
tasksApp.post("/edit/:id", async (c) => {
    const db = c.get("db");
    const taskId = c.req.param("id");
    const userId = c.get("user")?.id;
    const body = await c.req.json();
    if (!userId) {
        return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    }
    await db
        .update(tasksTable)
        .set({
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        startAt: body.startAt,
        dueAt: body.dueAt,
    })
        .where(and(eq(tasksTable.id, Number(taskId)), eq(tasksTable.userId, userId)));
    return c.json({ task: body.title, taskId: taskId });
});
export default tasksApp;
