import { z } from "zod";

export const continentBodySchema = z.object({
  name: z.string().trim().min(1, "Nome e obrigatório."),
  code: z.string().trim().min(1, "Código e obrigatório.").max(8),
  description: z.string().trim().min(1, "Descrição é obrigatória.")
});

export const createContinentSchema = z.object({
  body: continentBodySchema
});

export const updateContinentSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: continentBodySchema.partial()
});
