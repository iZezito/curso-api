import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "../../drizzle/schema";

export const db = drizzle(process.env.DATABASE_URL!, { schema });
