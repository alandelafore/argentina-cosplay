import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

interface TokenPayload {
  sub: string;
  roles: string[];
}

export interface GraphQLContext {
  user: { id: string; roles: string[] } | null;
}

export function createContext({ req }: { req: any }): GraphQLContext {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return { user: null };
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return { user: { id: payload.sub, roles: payload.roles } };
  } catch {
    return { user: null };
  }
}
