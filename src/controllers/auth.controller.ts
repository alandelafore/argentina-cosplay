import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecret";
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

function signAccessToken(userId: string, roles: string[]) {
  return jwt.sign({ sub: userId, roles }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

function signRefreshToken(userId: string, roles: string[]) {
  return jwt.sign({ sub: userId, roles }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

export async function register(req: Request, res: Response) {
  const { email, password, name, phone, cuit, roles } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      phone,
      cuit,
      roles: {
        create: (roles || ["COMPRADOR"]).map((role: string) => ({ role })),
      },
    },
  });

  const accessToken = signAccessToken(user.id, (roles || ["COMPRADOR"]));
  const refreshToken = signRefreshToken(user.id, (roles || ["COMPRADOR"]));

  return res.status(201).json({ user: { id: user.id, email: user.email, name: user.name }, accessToken, refreshToken });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: true },
  });

  if (!user) {
    return res.status(401).json({ message: "Credenciales inválidas" });
  }

  if (user.isSuspended) {
    return res.status(403).json({ message: "Cuenta suspendida" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: "Credenciales inválidas" });
  }

  const roles = user.roles.map((entry) => entry.role);
  const accessToken = signAccessToken(user.id, roles);
  const refreshToken = signRefreshToken(user.id, roles);

  return res.json({ accessToken, refreshToken });
}

export async function refreshToken(req: Request, res: Response) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Refresh token no proporcionado" });
  }

  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as { sub: string; roles: string[] };
    const accessToken = signAccessToken(payload.sub, payload.roles);
    const refreshTokenNew = signRefreshToken(payload.sub, payload.roles);
    return res.json({ accessToken, refreshToken: refreshTokenNew });
  } catch (error) {
    return res.status(401).json({ message: "Refresh token inválido" });
  }
}
