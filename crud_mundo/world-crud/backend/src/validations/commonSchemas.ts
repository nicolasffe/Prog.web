import { z } from "zod";

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});

export const optionalSearchSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    countryId: z.string().optional(),
    continentId: z.string().optional()
  })
});

export const latitudeSchema = z.coerce
  .number()
  .min(-90, "Latitude deve estar entre -90 e 90.")
  .max(90, "Latitude deve estar entre -90 e 90.");

export const longitudeSchema = z.coerce
  .number()
  .min(-180, "Longitude deve estar entre -180 e 180.")
  .max(180, "Longitude deve estar entre -180 e 180.");
