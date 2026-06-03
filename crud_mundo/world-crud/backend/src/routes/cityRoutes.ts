import { Router } from "express";
import { cityController } from "../controllers/cityController";
import { validateRequest } from "../middlewares/validateRequest";
import { idParamSchema, optionalSearchSchema } from "../validations/commonSchemas";
import { createCitySchema, updateCitySchema } from "../validations/citySchemas";

export const cityRoutes = Router();

cityRoutes.post("/", validateRequest(createCitySchema), cityController.create);
cityRoutes.get("/", validateRequest(optionalSearchSchema), cityController.list);
cityRoutes.get("/:id", validateRequest(idParamSchema), cityController.findById);
cityRoutes.put("/:id", validateRequest(updateCitySchema), cityController.update);
cityRoutes.delete("/:id", validateRequest(idParamSchema), cityController.delete);
