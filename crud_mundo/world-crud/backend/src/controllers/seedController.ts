import { Request, Response } from "express";
import { seedService } from "../services/SeedService";
import { asyncHandler } from "../utils/asyncHandler";

export const seedController = {
  continents: asyncHandler(async (_req: Request, res: Response) => {
    const continents = await seedService.seedContinents();
    return res.status(201).json({
      message: "Continentes populados com sucesso.",
      count: continents.length,
      data: continents
    });
  }),

  countries: asyncHandler(async (_req: Request, res: Response) => {
    const countries = await seedService.seedCountries();
    return res.status(201).json({
      message: "Paises e cidades populados com sucesso.",
      count: countries.length,
      data: countries
    });
  })
};
