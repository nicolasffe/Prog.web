import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(8, "JWT_SECRET must have at least 8 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  PORT: z.coerce.number().default(3333),
  OPENWEATHER_API_KEY: z.string().optional().default(""),
  GEONAMES_USERNAME: z.string().optional().default("")
});

export const env = envSchema.parse(process.env);
