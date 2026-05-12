import { gql } from "apollo-server-express";

export const typeDefs = gql`
  enum Role {
    COMPRADOR
    VENDEDOR
    ADMIN
  }

  enum ProductCondition {
    NUEVO
    USADO
  }

  enum OrderStatus {
    PENDIENTE
    PAGADO
    ENVIADO
    ENTREGADO
    CANCELADO
    REEMBOLSADO
  }

  type User {
    id: String!
    email: String!
    name: String!
    phone: String
    cuit: String
    roles: [Role!]!
    isSuspended: Boolean!
  }

  type Category {
    id: String!
    name: String!
    slug: String!
    parentId: String
    children: [Category!]
    attributes: [CategoryAttribute!]
  }

  type CategoryAttribute {
    id: String!
    name: String!
    type: String!
    required: Boolean!
    options: [String!]!
  }

  type ProductImage {
    id: String!
    url: String!
    position: Int!
  }

  type ProductVariant {
    id: String!
    sku: String!
    size: String
    color: String
    stock: Int!
    price: Float
  }

  type ProductAttribute {
    id: String!
    value: String!
    attributeDefinition: CategoryAttribute!
  }

  type Product {
    id: String!
    title: String!
    description: String!
    price: Float!
    condition: ProductCondition!
    status: String!
    stock: Int!
    tags: [String!]!
    sellerId: String!
    seller: User!
    category: Category!
    images: [ProductImage!]!
    variants: [ProductVariant!]!
    attributes: [ProductAttribute!]!
  }

  type CartItem {
    id: String!
    product: Product!
    variant: ProductVariant
    quantity: Int!
    unitPrice: Float!
  }

  type Cart {
    id: String!
    sellerId: String!
    items: [CartItem!]!
  }

  type OrderItem {
    id: String!
    product: Product!
    variant: ProductVariant
    quantity: Int!
    unitPrice: Float!
  }

  type Order {
    id: String!
    buyerId: String!
    sellerId: String!
    status: OrderStatus!
    totalAmount: Float!
    commission: Float!
    items: [OrderItem!]!
  }

  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    user: User!
  }

  type ProductPage {
    data: [Product!]!
    page: Int!
    pageSize: Int!
  }

  input AttributeFilterInput {
    definitionId: String
    name: String
    value: String!
  }

  input ProductFilterInput {
    categoryId: String
    minPrice: Float
    maxPrice: Float
    condition: ProductCondition
    search: String
    attributes: [AttributeFilterInput!]
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String!
    phone: String
    cuit: String
    roles: [Role!]
  }

  input CreateProductAttributeInput {
    definitionId: String!
    value: String!
  }

  input CreateProductVariantInput {
    sku: String!
    size: String
    color: String
    stock: Int!
    price: Float
  }

  input CreateProductInput {
    title: String!
    description: String!
    price: Float!
    categoryId: String!
    condition: ProductCondition!
    stock: Int!
    tags: [String!]
    images: [String!]
    attributes: [CreateProductAttributeInput!]
    variants: [CreateProductVariantInput!]
  }

  input CreateCategoryInput {
    name: String!
    slug: String!
    parentId: String
    attributes: [CreateCategoryAttributeInput!]
  }

  input CreateCategoryAttributeInput {
    name: String!
    type: String!
    required: Boolean
    options: [String!]
  }

  input AddCartItemInput {
    productId: String!
    variantId: String
    quantity: Int!
  }

  type Query {
    me: User
    product(id: String!): Product
    products(filter: ProductFilterInput, page: Int, pageSize: Int): ProductPage!
    categories: [Category!]!
    category(id: String!): Category
    order(id: String!): Order
    cart: Cart
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createProduct(input: CreateProductInput!): Product!
    createCategory(input: CreateCategoryInput!): Category!
    addCartItem(input: AddCartItemInput!): Cart!
    removeCartItem(itemId: String!): Cart!
    createOrder: Order!
  }
`;
