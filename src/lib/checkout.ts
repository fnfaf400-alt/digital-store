import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(6).max(80),
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(6).max(80),
});

export const productSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(8).max(280),
  longDescription: z.string().trim().min(20).max(4000),
  priceCents: z.number().int().min(0),
  type: z.string().trim().min(2).max(40),
  coverEmoji: z.string().trim().min(1).max(8),
  fileName: z.string().trim().min(3).max(120),
  fileContent: z.string().trim().min(4),
  downloadLimit: z.number().int().min(1).max(50),
  categoryId: z.string().min(1),
  published: z.boolean().optional(),
});

export const checkoutSchema = z.object({
  productId: z.string().min(1),
});
