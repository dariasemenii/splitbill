import { z } from "zod";

// ── Базові поля ──

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email());
export const currencySchema = z.string().trim().toUpperCase().length(3);
export const personNameSchema = z.string().trim().min(1).max(100);
export const deviceNameSchema = z.string().trim().max(100).optional();
export const otpCodeSchema = z.string().regex(/^\d{6}$/, "Код має складатися з 6 цифр");

// ── Авторизація ──

export const RequestCodeBody = z.object({ email: emailSchema });

export const VerifyCodeBody = z.object({
  email: emailSchema,
  code: otpCodeSchema,
  deviceName: deviceNameSchema,
});

export const OAuthBody = z.object({
  provider: z.enum(["google", "apple"]),
  idToken: z.string().min(1),
  // Для Apple: ім'я, яке клієнт отримав при першому вході
  name: personNameSchema.optional(),
  deviceName: deviceNameSchema,
});

export const RefreshBody = z.object({ refreshToken: z.string().min(1) });

// ── Профіль ──

export const UpdateMeBody = z
  .object({
    name: personNameSchema,
    avatarUrl: z.url().nullable(),
    defaultCurrency: currencySchema,
  })
  .partial();

// ── Групи ──

export const CreateGroupBody = z.object({
  name: z.string().trim().min(1).max(100),
  currency: currencySchema.default("UAH"),
  // Як мене показувати в цій групі; за замовчуванням ім'я з профілю
  displayName: personNameSchema.optional(),
  // Друзі, яких додаємо одразу за іменем (ще без акаунта)
  members: z.array(personNameSchema).max(50).default([]),
});

// Тіла запитів у тому вигляді, в якому їх надсилає клієнт
export type RequestCodeInput = z.input<typeof RequestCodeBody>;
export type VerifyCodeInput = z.input<typeof VerifyCodeBody>;
export type OAuthInput = z.input<typeof OAuthBody>;
export type UpdateMeInput = z.input<typeof UpdateMeBody>;
export type CreateGroupInput = z.input<typeof CreateGroupBody>;
