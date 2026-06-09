import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { HttpError } from "../utils/HttpError";

type JwtPayload = {
  id: string;
  name: string;
  email: string;
};

type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new HttpError(401, "Token de autenticação não informado.");
  }

  const token = authorization.replace("Bearer ", "").trim();

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const authenticatedRequest = req as AuthenticatedRequest;
    authenticatedRequest.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email
    };
    next();
  } catch {
    throw new HttpError(401, "Token inválido ou expirado.");
  }
}
