import { Request, Response } from "express";
import { authService } from "../services/AuthService";
import { asyncHandler } from "../utils/asyncHandler";

type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

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
    const { user } = req as AuthenticatedRequest;
    return res.json({ user });
  })
};
