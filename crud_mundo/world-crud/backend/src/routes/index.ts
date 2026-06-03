import { Router } from "express";
import { authRoutes } from "./authRoutes";
import { cityRoutes } from "./cityRoutes";
import { continentRoutes } from "./continentRoutes";
import { countryRoutes } from "./countryRoutes";
import { dashboardRoutes } from "./dashboardRoutes";
import { externalRoutes } from "./externalRoutes";
import { seedRoutes } from "./seedRoutes";
import { weatherRoutes } from "./weatherRoutes";
import { authMiddleware } from "../middlewares/authMiddleware";

export const routes = Router();

routes.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

routes.use("/auth", authRoutes);
routes.use("/dashboard", authMiddleware, dashboardRoutes);
routes.use("/continents", authMiddleware, continentRoutes);
routes.use("/countries", authMiddleware, countryRoutes);
routes.use("/cities", authMiddleware, cityRoutes);
routes.use("/weather", authMiddleware, weatherRoutes);
routes.use("/external", authMiddleware, externalRoutes);
routes.use("/seed", authMiddleware, seedRoutes);
