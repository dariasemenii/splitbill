import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET має бути щонайменше 32 символи"),
  OTP_SECRET: z.string().min(32, "OTP_SECRET має бути щонайменше 32 символи"),
  // Client ID з Google Cloud (iOS, Android, Web) через кому
  GOOGLE_CLIENT_IDS: z.string().default(""),
  // Bundle ID iOS-застосунку, напр. com.yourname.split
  APPLE_BUNDLE_ID: z.string().default(""),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Split <no-reply@example.com>"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = EnvSchema.parse(process.env);
