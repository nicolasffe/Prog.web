import { Router } from "express";
import { z } from "zod";
import { externalController } from "../controllers/externalController";
import { validateRequest } from "../middlewares/validateRequest";

export const externalRoutes = Router();

externalRoutes.get("/countries", externalController.countries);
externalRoutes.get(
  "/cities/search",
  validateRequest(
    z.object({
      query: z.object({
        q: z.string().min(1),
        countryCode: z.string().optional()
      })
    })
  ),
  externalController.citiesSearch
);
