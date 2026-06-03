import { Request, Response } from "express";
import { continentService } from "../services/ContinentService";
import { asyncHandler } from "../utils/asyncHandler";

export const continentController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const continent = await continentService.create(req.body);
    return res.status(201).json(continent);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const continents = await continentService.list(req.query.search as string);
    return res.json(continents);
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const continent = await continentService.findById(req.params.id);
    return res.json(continent);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const continent = await continentService.update(req.params.id, req.body);
    return res.json(continent);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await continentService.delete(req.params.id);
    return res.status(204).send();
  })
};
