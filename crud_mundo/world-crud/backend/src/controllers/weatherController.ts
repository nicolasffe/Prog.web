import { Request, Response } from "express";
import { weatherService } from "../services/WeatherService";
import { asyncHandler } from "../utils/asyncHandler";

export const weatherController = {
  getByCity: asyncHandler(async (req: Request, res: Response) => {
    const weather = await weatherService.getByCityId(req.params.cityId);
    return res.json(weather);
  })
};
