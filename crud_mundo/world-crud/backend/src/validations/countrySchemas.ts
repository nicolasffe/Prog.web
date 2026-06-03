import { z } from "zod";
import { latitudeSchema, longitudeSchema } from "./commonSchemas";

export const countryBodySchema = z.object({
  name: z.string().trim().min(1, "Nome e obrigatorio."),
  officialName: z.string().trim().optional().nullable(),
  code: z.string().trim().min(1, "Codigo do pais e obrigatorio.").max(8),
  capital: z.string().trim().optional().nullable(),
  region: z.string().trim().optional().nullable(),
  subregion: z.string().trim().optional().nullable(),
  population: z.coerce.number().int().nonnegative().optional().nullable(),
  area: z.coerce.number().nonnegative().optional().nullable(),
  latitude: latitudeSchema.optional().nullable(),
  longitude: longitudeSchema.optional().nullable(),
  flagUrl: z.string().url().optional().or(z.literal("")).nullable(),
  continentId: z.string().min(1, "Pais precisa pertencer a um continente.")
});

export const createCountrySchema = z.object({
  body: countryBodySchema
});

export const updateCountrySchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: countryBodySchema.partial()
});
