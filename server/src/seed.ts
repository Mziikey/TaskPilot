import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { tasks } from "./db/schema.js";

const db = drizzle(process.env.DB_FILE_NAME!);

const main = async () => {
  for (let i = 0; i <= 10; i++) {
    const task: typeof tasks.$inferInsert = {
      title: `test ${i}`,
    };

    const x = await db.insert(tasks).values(task);
    console.log(x);
  }
};

main();
