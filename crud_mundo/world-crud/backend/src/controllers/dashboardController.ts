import { Request, Response } from "express";
import { dashboardService } from "../services/DashboardService";
import { asyncHandler } from "../utils/asyncHandler";

export const dashboardController = {
  stats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await dashboardService.stats();
    return res.json(stats);
  })
};
