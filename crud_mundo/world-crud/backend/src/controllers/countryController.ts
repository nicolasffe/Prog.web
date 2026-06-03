import { Request, Response } from "express";
import { countryService } from "../services/CountryService";
import { asyncHandler } from "../utils/asyncHandler";

export const countryController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const country = await countryService.create(req.body);
    return res.status(201).json(country);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const countries = await countryService.list({
      search: req.query.search as string,
      continentId: req.query.continentId as string
    });
    return res.json(countries);
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const country = await countryService.findById(req.params.id);
    return res.json(country);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const country = await countryService.update(req.params.id, req.body);
    return res.json(country);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await countryService.delete(req.params.id);
    return res.status(204).send();
  })
};
