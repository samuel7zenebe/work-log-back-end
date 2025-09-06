import { Hono } from 'hono';
import { drizzle } from "drizzle-orm/neon-http";
import { usersTable } from './db/schema';
import {cors} from "hono/cors"
import {logger} from "hono/logger"

const app = new Hono();

app.use("/api/*",cors())
app.use(logger());

app.get('/', async (c) => {
  try {
    const db = drizzle(process.env.DATABASE_URL!);
    const insertedUsers:typeof usersTable.$inferSelect[] = await db.select().from(usersTable);   
    return c.json(insertedUsers);
  } catch (error) {
    console.error('Database query failed:', error);
    return c.text('Failed to connect to database', 500);
  }
});
app.get("/hello",async (c)=>{
  return c.json({
   "message":"Hello Man" 
  })
})

export default {
  port: process.env.PORT || 4000,
  fetch: app.fetch,
};