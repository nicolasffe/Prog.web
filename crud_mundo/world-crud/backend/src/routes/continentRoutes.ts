import { Router } from "express";
import { continentController } from "../controllers/continentController";
import { validateRequest } from "../middlewares/validateRequest";
import { idParamSchema, optionalSearchSchema } from "../validations/commonSchemas";
import {
  createContinentSchema,
  updateContinentSchema
} from "../validations/continentSchemas";

export const continentRoutes = Router();

continentRoutes.post("/", validateRequest(createContinentSchema), continentController.create);
continentRoutes.get("/", validateRequest(optionalSearchSchema), continentController.list);
continentRoutes.get("/:id", validateRequest(idParamSchema), continentController.findById);
continentRoutes.put("/:id", validateRequest(updateContinentSchema), continentController.update);
continentRoutes.delete("/:id", validateRequest(idParamSchema), continentController.delete);
