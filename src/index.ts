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
  "https://work-log-back-end.onrender.com",
];
app.use(
  "*",
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? allowedOrigins[1]
        : allowedOrigins[0],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    credentials: true,
  })
);
app.use(logger());

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

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

app.get("/register", async (c) => {
  try {
    const { user } = await auth.api.signUpEmail({
      body: {
        email: "someone@gmail.com",
        name: "Some One",
        password: "someonesomeone",
        rememberMe: true,
      },
    });
    if (user) {
      return c.json(user);
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
