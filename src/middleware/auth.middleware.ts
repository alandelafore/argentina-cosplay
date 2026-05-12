import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  sub: string;
  roles: string[];
  iat: number;
  exp: number;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "") as TokenPayload;
    req.user = { id: payload.sub, roles: payload.roles } as any;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
}
