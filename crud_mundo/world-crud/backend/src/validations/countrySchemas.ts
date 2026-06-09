import { z } from "zod";
import { latitudeSchema, longitudeSchema } from "./commonSchemas";

const imageDataUrlSchema = z.string().regex(/^data:image\/(png|jpe?g|svg\+xml|webp);base64,/i);

export const countryBodySchema = z.object({
  name: z.string().trim().min(1, "Nome e obrigatório."),
  officialName: z.string().trim().optional().nullable(),
  code: z.string().trim().min(1, "Código do país e obrigatório.").max(8),
  capital: z.string().trim().optional().nullable(),
  region: z.string().trim().optional().nullable(),
  subregion: z.string().trim().optional().nullable(),
  population: z.coerce.number().int().nonnegative(),
  language: z.string().trim().min(1, "Idioma oficial e obrigatório."),
  currency: z.string().trim().min(1, "Moeda e obrigatória."),
  area: z.coerce.number().nonnegative().optional().nullable(),
  latitude: latitudeSchema.optional().nullable(),
  longitude: longitudeSchema.optional().nullable(),
  flagUrl: z.union([z.string().url(), imageDataUrlSchema, z.literal("")]).optional().nullable(),
  continentId: z.string().min(1, "País precisa pertencer a um continente.")
});

export const createCountrySchema = z.object({
  body: countryBodySchema
});

export const updateCountrySchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: countryBodySchema.partial()
});
