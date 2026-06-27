import { cors as honoCors } from "hono/cors";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://simplyvest.pages.dev",
  "https://app.simplyvest.xyz",
  "https://www.simplyvest.xyz",
];

export const cors = honoCors({
  origin: (origin) => {
    if (!origin) return "*";
    if (ALLOWED_ORIGINS.includes(origin)) return origin;
    if (origin.endsWith(".simplyvest.pages.dev")) return origin;
    return ALLOWED_ORIGINS[0];
  },
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
});
