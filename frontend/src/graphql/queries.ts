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
        category {
          id
          name
        }
      }
      page
      pageSize
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      children {
        id
        name
      }
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      phone
      cuit
      roles
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
      user {
        id
        email
        name
        phone
        cuit
        roles
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        name
        phone
        cuit
        roles
      }
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      email
      name
      phone
      cuit
      roles
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: String!) {
    product(id: $id) {
      id
      title
      description
      price
      condition
      stock
      tags
      images {
        url
      }
      category {
        id
        name
      }
      seller {
        id
        name
      }
    }
  }
`;

export const GET_CART = gql`
  query GetCart {
    cart {
      id
      sellerId
      items {
        id
        quantity
        unitPrice
        product {
          id
          title
          price
          condition
          images {
            url
          }
        }
        variant {
          id
          sku
          size
          color
        }
      }
    }
  }
`;

export const ADD_CART_ITEM = gql`
  mutation AddCartItem($input: AddCartItemInput!) {
    addCartItem(input: $input) {
      id
      items {
        id
        quantity
        unitPrice
        product {
          id
          title
          images {
            url
          }
        }
      }
    }
  }
`;

export const REMOVE_CART_ITEM = gql`
  mutation RemoveCartItem($itemId: String!) {
    removeCartItem(itemId: $itemId) {
      id
      items {
        id
        quantity
        unitPrice
        product {
          id
          title
          images {
            url
          }
        }
      }
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder {
    createOrder {
      id
      status
      totalAmount
    }
  }
`;
