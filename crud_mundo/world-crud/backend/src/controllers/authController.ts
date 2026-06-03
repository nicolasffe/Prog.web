import { Request, Response } from "express";
import { authService } from "../services/AuthService";
import { asyncHandler } from "../utils/asyncHandler";

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    return res.status(201).json(result);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    return res.json(result);
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    return res.json({ user: req.user });
  })
};
