import { Router } from "express";
import { countryController } from "../controllers/countryController";
import { validateRequest } from "../middlewares/validateRequest";
import { idParamSchema, optionalSearchSchema } from "../validations/commonSchemas";
import { createCountrySchema, updateCountrySchema } from "../validations/countrySchemas";

export const countryRoutes = Router();

countryRoutes.post("/", validateRequest(createCountrySchema), countryController.create);
countryRoutes.get("/", validateRequest(optionalSearchSchema), countryController.list);
countryRoutes.get("/:id", validateRequest(idParamSchema), countryController.findById);
countryRoutes.put("/:id", validateRequest(updateCountrySchema), countryController.update);
countryRoutes.delete("/:id", validateRequest(idParamSchema), countryController.delete);
