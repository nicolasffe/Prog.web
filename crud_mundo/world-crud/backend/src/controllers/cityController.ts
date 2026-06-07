import { Request, Response } from "express";
import { cityService } from "../services/CityService";
import { asyncHandler } from "../utils/asyncHandler";

export const cityController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const city = await cityService.create(req.body);
    return res.status(201).json(city);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const cities = await cityService.list({
      search: req.query.search as string,
      countryId: req.query.countryId as string,
      continentId: req.query.continentId as string
    });
    return res.json(cities);
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const city = await cityService.findById(req.params.id);
    return res.json(city);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const city = await cityService.update(req.params.id, req.body);
    return res.json(city);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await cityService.delete(req.params.id);
    return res.status(204).send();
  })
};
