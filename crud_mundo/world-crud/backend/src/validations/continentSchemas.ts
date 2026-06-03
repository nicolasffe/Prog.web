import { z } from "zod";

export const continentBodySchema = z.object({
  name: z.string().trim().min(1, "Nome e obrigatorio."),
  code: z.string().trim().min(1, "Codigo e obrigatorio.").max(8),
  description: z.string().trim().optional().nullable()
});

export const createContinentSchema = z.object({
  body: continentBodySchema
});

export const updateContinentSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: continentBodySchema.partial()
});
