import { ApolloServer } from "apollo-server-express";
import { Express } from "express";
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";
import { createContext } from "./context";

export async function registerGraphQL(app: Express) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: createContext,
  });

  const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

  await server.start();
  server.applyMiddleware({
    app,
    path: "/graphql",
    cors: {
      origin: allowedOrigin,
      credentials: true,
    },
  });
}
