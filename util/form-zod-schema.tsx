import { z } from "zod";

export const essentialsSchema = z.object({
  title: z
    .string()
    .min(1, "O Nome do produto é obrigatório")
    .max(50, "Produto deve ter no máximo 50 caracteres"),
  price: z
    .number({ invalid_type_error: "O preço deve ser um número" })
    .nonnegative("O preço não pode ser negativo")
    .default(0),
  status: z.enum(["pending", "purchased", "canceled"], {
    message: "O status é incopatível",
  }),
  quantity: z.number().int("A quantidade deve ser um número inteiro"),
  subdomain: z.string().min(1, "Verifique seu link"),
});

export const plannedSchema = z.object({
  title: z
    .string()
    .min(1, "O Nome do produto é obrigatório")
    .max(50, "Produto deve ter no máximo 50 caracteres"),
  price: z
    .number()
    .positive("O número deve ser positivo")
    .gte(1, "O número deve ser maior que 0"),
  priority: z.enum(["low", "medium", "high"], {
    message: "O status é incopatível",
  }),
  status: z.enum(["pending", "purchased", "canceled"], {
    message: "O status é incopatível",
  }),
  productUrl: z.optional(z.string()),
  description: z.optional(z.string()),
  subdomain: z.string().min(1, "Verifique seu link"),
  image: z.string(),
});

const SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export const appSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  description: z.string().max(500, "Máximo de 500 caracteres").optional(),
  subdomain: z
    .string()
    .min(1, "Subdomínio obrigatório")
    .max(63, "Máximo de 63 caracteres")
    .transform((val) => val.toLowerCase())
    .refine((val) => SUBDOMAIN_REGEX.test(val), {
      message: "Use apenas a–z, 0–9 e hifens, sem hífens nas extremidades.",
    }),
});

export const plannedCommentSchema = z.object({
  content: z.string().min(1, "Escreva seu comentário"),
  author: z.string(),
  planned: z.string(),
});
