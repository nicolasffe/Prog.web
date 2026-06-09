import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Nome e obrigatório."),
    email: z.string().trim().email("E-mail inválido.").toLowerCase(),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres.")
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("E-mail inválido.").toLowerCase(),
    password: z.string().min(1, "Senha é obrigatória.")
  })
});
