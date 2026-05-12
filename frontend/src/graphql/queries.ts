import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query GetProducts($filter: ProductFilterInput, $page: Int, $pageSize: Int) {
    products(filter: $filter, page: $page, pageSize: $pageSize) {
      data {
        id
        title
        description
        price
        condition
        images {
          url
        }
      }
      page
      pageSize
    }
  }
`;
