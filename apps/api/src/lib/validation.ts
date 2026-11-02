import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email());
export const currencySchema = z.string().trim().toUpperCase().length(3);
export const deviceNameSchema = z.string().trim().max(100).optional();
export const personNameSchema = z.string().trim().min(1).max(100);
