import { Router } from "express";
import { seedController } from "../controllers/seedController";

export const seedRoutes = Router();

seedRoutes.post("/continents", seedController.continents);
seedRoutes.post("/countries", seedController.countries);
