import { ApolloClient, InMemoryCache, createHttpLink, fromPromise } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { clearAuthTokens, getAccessToken, refreshAuthToken } from "../auth";

const authLink = setContext((_, { headers }) => {
  const token = getAccessToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  const needsRefresh = graphQLErrors?.some((error) => {
    const message = error.message || "";
    return ["No autorizado", "UNAUTHENTICATED", "jwt expired"].some((value) => message.includes(value));
  });

  if (!needsRefresh) {
    return;
  }

  return fromPromise(
    refreshAuthToken().catch((error) => {
      clearAuthTokens();
      console.warn("Token refresh failed:", error);
      return null;
    })
  )
    .filter((value) => Boolean(value))
    .flatMap((accessToken) => {
      const oldHeaders = operation.getContext().headers || {};
      operation.setContext({
        headers: {
          ...oldHeaders,
          authorization: `Bearer ${accessToken}`,
        },
      });
      return forward(operation);
    });
});

const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql",
  credentials: "include",
});

export const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(),
});
