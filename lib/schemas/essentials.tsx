import { z } from "zod";

export const essentialsSchema = z.object({
  title: z.string().max(50, "Produto deve ter no máximo 50 caracteres"),
  price: z.number().min(0, "Preço deve ser maior que 0"),
  status: z.enum(["pending", "purchased", "canceled"]),
  quantity: z
    .number()
    .gte(1, "Quantidade mínima é 1")
    .lte(99, "Quantidade máxima é 99"),
});
