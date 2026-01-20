import { z } from "zod";

export const essentialsSchema = z.object({
  title: z
    .string()
    .min(1, "O Nome do produto é obrigatório")
    .max(50, "Produto deve ter no máximo 50 caracteres"),
  price: z.coerce
    .number({ invalid_type_error: "O preço deve ser um número" })
    .nonnegative("O preço não pode ser negativo")
    .default(0),
  status: z.enum(["PENDING", "PURCHASED", "CANCELLED"], {
    message: "O status é incopatível",
  }),
  quantity: z.coerce
    .number()
    .int("A quantidade deve ser um número inteiro")
    .default(1),
  subdomain: z.string().min(1, "Verifique seu link"),
  id: z.string().cuid().optional(),
});

export const plannedSchema = z.object({
  title: z
    .string()
    .min(1, "O Nome do produto é obrigatório")
    .max(500, "Produto deve ter no máximo 500 caracteres"),
  price: z.preprocess(
    (v) => (v === "" || v == null ? 0 : v),
    z.coerce.number().nonnegative(),
  ),
  quantity: z.preprocess(
    (v) => (v === "" || v == null ? 1 : v),
    z.coerce.number().nonnegative(),
  ),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"], {
    message: "Escolha a prioridade copatível",
  }),
  status: z.enum(["PENDING", "PURCHASED", "CANCELLED"], {
    message: "O status é incopatível",
  }),
  productUrl: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().url().optional(),
  ),
  description: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().optional(),
  ),
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

export const inviteSchema = z.object({
  appId: z.string().cuid(),
  email: z.string().email("Deve ser um e-mail válido"),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]).default("MEMBER"),
});

export const statusUpdateSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(["PENDING", "PURCHASED", "CANCELLED"], {
    message: "O status é incopatível",
  }),
  subdomain: z
    .string()
    .min(1)
    .max(63)
    .transform((val) => val.toLowerCase())
    .refine((val) => SUBDOMAIN_REGEX.test(val), {
      message: "Error",
    }),
});

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(120, "Use 120 characters or fewer."),
  description: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().max(500, "Use 500 characters or fewer.").optional(),
  ),
  subdomain: z.string().min(1, "Verifique seu link"),
});

export const projectLinkSchema = z.object({
  projectId: z.string().cuid(),
  plannedId: z.string().cuid(),
  subdomain: z.string().min(1, "Verifique seu link"),
});
