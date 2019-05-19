export default `
  type Product {
    product_id: ID!
    name: String!
    description: String!
    price: Float!
    discounted_price: Float!
    image: String
    image_2: String
    thumbnail: String
    display: Int
    category: [Category!]!
    attributes: [AttributeValue!]!
  }

  type Category {
    category_id: ID!
    department: Department!
    name: String!
    description: String
  }

  type Department {
    department_id: ID!
    name: String!
    description: String
  }

  type AttributeValue {
    attribute_value_id: ID!
    attribute: Attribute!
    value: String!
  }

  type Attribute {
    attribute_id: ID!
    name: String!
  }

  type AggregateItem {
    count: Int
  }

  type ProductAttribute {
    product_id: ID!
    attribute_value_id: ID!
  }

  type Customer {
    customer_id: ID!
    name: String!
    email: String!
    credit_card: String
    address_1: String
    address_2: String
    city: String
    region: String
    postal_code: String
    country: String
    shipping_region_id: Int
  }

  type SuccessMessage {
    message: String
  }

  type CartItem {
    item_id: ID!
    cart_id: String!
    product: Product!
    attributes: String!
    quantity: Int!
    buy_now: Int!
    added_on: String!
  }

  type ShippingRegion {
    shipping_region_id: ID!
    shipping_region: String!
  }

  type Shipping {
    shipping_id: ID!
    shipping_type: String!
    shipping_cost: Float!
    shipping_region_id: ID!
  }

  type Orders {
    order_id: ID!
    total_amount: Float!
    created_on: String!
    shipped_on: String
    status: String!
    reference: String!
    orderDetail: [OrderDetail!]!
  }

  type OrderDetail {
    item_id: ID!
    order_id: Int!
    product_id: Int!
    attributes: String!
    product_name: String!
    quantity: Int!
    unit_cost: Float!
    subtotal: Float!
    product: Product!
  }

  type Query {
    products(limit: Int, offset: Int, categories: [Int], departments: [Int]): [Product!]!
    searchProducts(searchTerm: String!, limit: Int): [Product!]!
    product(id: ID!): Product
    productsCount(categories: [Int], departments: [Int]): AggregateItem!
    departments: [Department!]!
    categories: [Category!]!
    attributes: [Attribute!]!
    productattributes(id: ID!): [ProductAttribute!]!
    me: Customer
    cartItems(cartId: String): [CartItem!]!
    shippingRegions: [ShippingRegion!]!
    shippings: [Shipping!]!
    orders: [Orders!]!
    order(id: ID!): Orders!
  }

  type Mutation {
    signup(email: String!, password: String!, name: String!): Customer!
    signin(email: String!, password: String!): Customer!
    signout: SuccessMessage
    addToCart(cartId: String, attributes: String!, quantity: Int!, productId: ID!): CartItem!
    removeFromCart(cartId: String, productId: ID!): CartItem!
    incrementCartItem(cartId: String, productId: ID!): CartItem!
    decrementCartItem(cartId: String, productId: ID!): CartItem!
    updateCustomer(customer_id: ID!, email: String!, firstName: String!, lastName: String!, address: String!, city: String!, region: String!, country: String!, zipCode: String!, shippingRegion: Int!, shippingType: Int!): Customer!
    createOrder(authCode: String!, cartId: String, shippingId: Int!): Orders
  }
`;
