import { Router } from "express";
import { z } from "zod";
import { weatherController } from "../controllers/weatherController";
import { validateRequest } from "../middlewares/validateRequest";

export const weatherRoutes = Router();

weatherRoutes.get("/cities", weatherController.listCities);

weatherRoutes.get(
  "/city/:cityId",
  validateRequest(z.object({ params: z.object({ cityId: z.string().min(1) }) })),
  weatherController.getByCity
);
