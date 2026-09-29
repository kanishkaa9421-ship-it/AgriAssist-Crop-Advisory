import type { Request, RequestHandler } from "express";

export const DEMO_USER_ID = "11111111-1111-4111-8111-111111111111";

export function getUserId(req: Request): string {
  return req.header("x-user-id") ?? DEMO_USER_ID;
}

export const mockUserMiddleware: RequestHandler = (req, _res, next) => {
  req.userId = getUserId(req);
  next();
};

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}