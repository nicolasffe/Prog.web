import { z } from "zod";
import { latitudeSchema, longitudeSchema } from "./commonSchemas";

export const cityBodySchema = z.object({
  name: z.string().trim().min(1, "Nome e obrigatório."),
  state: z.string().trim().optional().nullable(),
  countryId: z.string().min(1, "Cidade precisa pertencer a um país."),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  population: z.coerce.number().int().nonnegative(),
  timezone: z.string().trim().optional().nullable()
});

export const createCitySchema = z.object({
  body: cityBodySchema
});

export const updateCitySchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: cityBodySchema.partial()
});
