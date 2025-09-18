import { Hono } from 'hono';
import { drizzle } from "drizzle-orm/neon-http";
import { user } from "./db/schema";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { db } from "./db";
import { auth } from "./lib/auth";

const app = new Hono();
const allowedOrigins = [
  "http://localhost:3000",
  "https://vercel-with-neon-postgres-indol-chi.vercel.app",
];
app.use(
  "*",
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? allowedOrigins[1]
        : allowedOrigins[0],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Explicitly allow POST for auth
    credentials: true,
  })
);

app.use(logger());

app.on(["POST", "GET", "OPTIONS"], "/api/auth/*", (c) =>
  auth.handler(c.req.raw)
);

app.get("/", async (c) => {
  try {
    const users = await db.select().from(user);
    return c.json(users);
  } catch (err) {
    console.log(err);
    return c.json({
      error: err,
    });
  }
});

app.get("/success", async (c) => {
  return c.html("<h1>Successful Registration.</h1>");
});

app.get("/register/:name", async (c) => {
  const name = c.req.param("name");
  try {
    const { user } = await auth.api.signUpEmail({
      body: {
        email: `${name}@gmail.com`,
        name: `${name}`,
        password: `${name}${name}@123`,
        rememberMe: true,
      },
    });
    if (user) {
      return c.json({
        Registered: true,
        Name: user.name,
      });
    } else {
      return c.json({
        error: "Not Registered...",
      });
    }
  } catch (err) {
    return c.json({ error: err });
  }
});

app.get("/hello", async (c) => {
  const allUsers = await db.select().from(user);
  return c.json({
    allUsers,
  });
});

export default {
  port: process.env.PORT || 4000,
  fetch: app.fetch,
};
