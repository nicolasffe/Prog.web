import { Request, Response } from "express";
import { externalGeoService } from "../services/ExternalGeoService";
import { HttpError } from "../utils/HttpError";
import { asyncHandler } from "../utils/asyncHandler";

export const externalController = {
  countries: asyncHandler(async (_req: Request, res: Response) => {
    const countries = await externalGeoService.getCountries();
    return res.json(countries);
  }),

  citiesSearch: asyncHandler(async (req: Request, res: Response) => {
    const query = String(req.query.q ?? "").trim();

    if (!query) {
      throw new HttpError(400, "Informe o parâmetro q para buscar cidades.");
    }

    const cities = await externalGeoService.searchCities(
      query,
      req.query.countryCode as string
    );

    return res.json(cities);
  })
};
