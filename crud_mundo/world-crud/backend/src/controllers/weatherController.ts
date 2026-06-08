import { Request, Response } from "express";
import { weatherService } from "../services/WeatherService";
import { asyncHandler } from "../utils/asyncHandler";

export const weatherController = {
  listCities: asyncHandler(async (req: Request, res: Response) => {
    const weather = await weatherService.listCitiesWeather(req.query.refresh === "true");
    return res.json(weather);
  }),

  getByCity: asyncHandler(async (req: Request, res: Response) => {
    const weather = await weatherService.getByCityId(req.params.cityId, req.query.refresh === "true");
    return res.json(weather);
  })
};
