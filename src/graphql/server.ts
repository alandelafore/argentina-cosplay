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

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });
}
