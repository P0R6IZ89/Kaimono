import { z } from "zod";

export const essentialsSchema = z.object({
  title: z
    .string()
    .min(1, "O Nome do produto é obrigatório")
    .max(50, "Produto deve ter no máximo 50 caracteres"),
  price: z.string().min(1, "O preço é obrigatório"),
  status: z.enum(["pending", "purchased", "canceled"]),
  quantity: z.string().min(1, "A quantidade é obrigatório"),
});
