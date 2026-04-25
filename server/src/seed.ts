import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { usersTable } from "./db/schema/user.js";
import * as argon2 from "argon2";
import type { tasksTable } from "./db/schema/task.js";

const db = drizzle(process.env.DB_FILE_NAME!);

// const insertTask = async () => {
//   for (let i = 0; i <= 10; i++) {
//     const task: typeof tasksTable.$inferInsert = {
//       title: `test ${i}`,
//     };

//     const x = await db.insert(tasksTable).values(task);
//     console.log(x);
//   }
// };

// const insertUser = async () => {
//   const user: typeof usersTable.$inferInsert = {
//     username: "gaokeyu",
//     passwordHash: await argon2.hash("passpass"),
//   };
//   await db.insert(usersTable).values(user);
//   console.log("user inserted");
// };

// insertTask();
// insertUser();
