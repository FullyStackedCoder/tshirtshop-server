const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const uuidV1 = require("uuid/v1");
const uniqid = require('uniqid');
const stripe = require("../stripe");

const pickPrice = (price, discountedPrice) => {
  if (discountedPrice > 0) {
    return discountedPrice;
  }
  return price;
};

const round = (value, decimals) => {
  return Number(Math.round(value + "e" + decimals) + "e-" + decimals).toFixed(
    decimals
  );
};

export default {
  Product: {
    category: (parent, args, ctx, info) => parent.getCategories(),
    attributes: (parent, args, ctx, info) => parent.getAttribute_values()
  },
  Category: {
    department: (parent, args, ctx, info) => parent.getDepartment()
  },
  AttributeValue: {
    attribute: (parent, args, ctx, info) => parent.getAttribute()
  },
  CartItem: {
    product: (parent, args, ctx, info) => parent.getProduct()
  },
  Orders: {
    orderDetail: (parent, args, ctx, info) => parent.getOrder_details()
  },
  OrderDetail: {
    product: (parent, args, ctx, info) => parent.getProduct()
  },
  Query: {
    async products(parent, args, ctx, info) {
      let categories = args.categories;
      if (!categories || categories.length < 1 || categories[0] === null) {
        categories = await ctx.db.category
          .findAll({}, info)
          .map(category => category.category_id);
      }
      let departments = args.departments;
      if (!departments || departments.length < 1 || departments[0] === null) {
        departments = await ctx.db.department
          .findAll({}, info)
          .map(department => department.department_id);
      }
      const products = await ctx.db.product.findAll(
        {
          offset: args.offset,
          limit: args.limit,
          order: [["product_id", "DESC"]],
          include: [
            {
              model: ctx.db.category,
              where: {
                [Op.and]: [
                  { category_id: categories },
                  { department_id: departments }
                ]
              }
            }
          ]
        },
        info
      );
      return products;
    },
    async searchProducts(parent, args, ctx, info) {
      const searchResults = await ctx.db.product.findAll(
        {
          limit: args.limit,
          where: {
            [Op.or]: [
              {
                name: {
                  [Op.like]: "%" + args.searchTerm + "%"
                }
              },
              { description: { [Op.like]: "%" + args.searchTerm + "%" } }
            ]
          }
        },
        info
      );
      return searchResults;
    },
    async product(parent, args, ctx, info) {
      const productAttribute = await ctx.db.product_attribute
        .findAll({ where: { product_id: args.id } }, info)
        .map(attribute => attribute.attribute_value_id);
      console.log(productAttribute);
      const product = await ctx.db.product.findOne(
        {
          where: { product_id: args.id },
          include: [{ model: ctx.db.attribute_value }]
        },
        info
      );
      return product;
    },
    async productsCount(parent, args, ctx, info) {
      let categories = args.categories;
      if (!categories || categories.length < 1 || categories[0] === null) {
        categories = await ctx.db.category
          .findAll({}, info)
          .map(category => category.category_id);
      }
      let departments = args.departments;
      if (!departments || departments.length < 1 || departments[0] === null) {
        departments = await ctx.db.department
          .findAll({}, info)
          .map(department => department.department_id);
      }
      const total = await ctx.db.product.findAndCountAll(
        {
          include: [
            {
              model: ctx.db.category,
              where: {
                [Op.and]: [
                  { category_id: categories },
                  { department_id: departments }
                ]
              }
            }
          ],
          distinct: true
        },
        info
      );
      return total;
    },
    async departments(parent, args, ctx, info) {
      const departments = await ctx.db.department.findAll({}, info);
      return departments;
    },
    async categories(parent, args, ctx, info) {
      const categories = await ctx.db.category.findAll({}, info);
      return categories;
    },
    async attributes(parent, args, ctx, info) {
      const attributes = await ctx.db.attribute.findAll({}, info);
      return attributes;
    },
    async productattributes(parent, args, ctx, info) {
      const attributeValues = await ctx.db.product_attribute.findAll(
        { where: { attribute_value_id: args.id } },
        info
      );
      return attributeValues;
    },
    me(parent, args, ctx, info) {
      if (!ctx.customerId) {
        return null;
      }
      return ctx.db.customer.findOne(
        { where: { customer_id: ctx.customerId } },
        info
      );
    },
    async cartItems(parent, args, ctx, info) {
      if (!args.cartId) {
        return [];
      }
      const cartItems = await ctx.db.shopping_cart.findAll({
        where: { cart_id: args.cartId }
      });
      return cartItems;
    },
    async shippingRegions(parent, args, ctx, info) {
      const shippingRegions = await ctx.db.shipping_region.findAll({}, info);
      return shippingRegions;
    },
    async shippings(parent, args, ctx, info) {
      const shippings = await ctx.db.shipping.findAll({}, info);
      return shippings;
    },
    async orders(parent, args, ctx, info) {
      const customerId = ctx.customerId;
      if (!customerId)
        throw new Error("You must be signed in to view your orders...");
      const orders = await ctx.db.orders.findAll(
        {
          order: [["created_on", "DESC"]],
          where: { customer_id: customerId },
          include: [{ model: ctx.db.order_detail }]
        },
        info
      );

      return orders;
    },
    async order(parent, args, ctx, info) {
      const customerId = ctx.customerId;
      if (!customerId)
        throw new Error("You must be signed in to view your orders...");
      const order = await ctx.db.orders.findOne(
        {
          where: {
            [Op.and]: [{ order_id: args.id }, { customer_id: customerId }]
          },
          include: [{ model: ctx.db.order_detail }]
        },
        info
      );

      return order;
    }
  },
  Mutation: {
    async signup(parent, args, ctx, info) {
      args.email = args.email.toLowerCase();
      const errors = [];
      if (!validator.isEmail(args.email)) {
        errors.push({ message: "E-mail is invalid!", field: "email" });
      }
      if (
        validator.isEmpty(args.password) ||
        !validator.isLength(args.password, { min: 6 })
      ) {
        errors.push({ message: "Password too short!", field: "password" });
      }
      if (
        validator.isEmpty(args.name) ||
        !validator.isLength(args.name, { min: 3 })
      ) {
        errors.push({
          message: "Please provide your full name!",
          field: "name"
        });
      }
      if (errors.length > 0) {
        const error = new Error("Invalid input.");
        error.data = errors;
        error.code = 422;
        throw error;
      }
      const existingCustomer = await ctx.db.customer.findOne({
        where: { email: args.email }
      });
      if (existingCustomer) {
        const error = new Error(
          "An account with that email already exists. Try a different email!"
        );
        error.code = 422;
        throw error;
      }
      // const password = await bcrypt.hash(args.password, 10);
      const customer = await ctx.db.customer.create(
        {
          ...args
        },
        info
      );
      const token = jwt.sign(
        { customerId: customer.customer_id },
        process.env.APP_SECRET
      );
      ctx.res.cookie("token", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
      });
      return customer;
    },
    async signin(parent, { email, password }, ctx, info) {
      const customer = await ctx.db.customer.findOne({ where: { email } });
      if (!customer) {
        throw new Error(`No such user found for email ${email}`);
      }
      // const valid = bcrypt.compare(password, customer.password);
      if (password !== customer.password) {
        throw new Error(`Invalid password!`);
      }
      const token = jwt.sign(
        { customerId: customer.customer_id },
        process.env.APP_SECRET
      );
      ctx.res.cookie("token", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
      });
      return customer;
    },
    signout(parent, args, ctx, info) {
      ctx.res.clearCookie("token");
      return { message: "You are logged out!" };
    },
    async addToCart(parent, args, ctx, info) {
      let whereObject = {
        [Op.and]: [{ cart_id: 0 }, { product_id: 0 }]
      };
      if (args.cartId) {
        whereObject = {
          [Op.and]: [{ cart_id: args.cartId }, { product_id: args.productId }]
        };
      }
      const existingCart = await ctx.db.shopping_cart.findOne({
        where: whereObject
      });
      if (existingCart) {
        const cart = await ctx.db.shopping_cart.update(
          {
            quantity: existingCart.dataValues.quantity + args.quantity,
            attributes: existingCart.dataValues.attributes
          },
          { where: whereObject },
          info
        );
        return existingCart.dataValues;
      }

      const errors = [];
      const attributesArray = args.attributes.split(" ");
      if (validator.isEmpty(attributesArray[0])) {
        errors.push({
          message: "Please pick a Size...",
          field: "attributes-size"
        });
      }
      if (validator.isEmpty(attributesArray[1])) {
        errors.push({
          message: "Please pick a Color...",
          field: "attributes-color"
        });
      }
      if (errors.length > 0) {
        const error = new Error("Invalid input.");
        error.data = errors;
        error.code = 422;
        throw error;
      }

      const cartId = uniqid();
      const cart = ctx.db.shopping_cart.create(
        {
          cart_id: args.cartId ? args.cartId : cartId,
          product_id: args.productId,
          attributes: args.attributes,
          quantity: args.quantity
        },
        info
      );
      return cart;
    },
    async removeFromCart(parent, args, ctx, info) {
      let whereObject = {
        [Op.and]: [{ cart_id: args.cartId }, { product_id: args.productId }]
      };
      const existingCart = await ctx.db.shopping_cart.findOne({
        where: whereObject
      });
      if (!existingCart) throw new Error("No Cart Item found!");
      const res = await ctx.db.shopping_cart.destroy(
        {
          where: whereObject
        },
        info
      );
      return existingCart.dataValues;
    },
    async incrementCartItem(parent, args, ctx, info) {
      let whereObject = {
        [Op.and]: [{ cart_id: args.cartId }, { product_id: args.productId }]
      };
      const existingCart = await ctx.db.shopping_cart.findOne({
        where: whereObject
      });
      if (!existingCart) throw new Error("No Cart Item found!");
      const cart = await ctx.db.shopping_cart.update(
        {
          quantity: existingCart.dataValues.quantity + 1
        },
        { where: whereObject },
        info
      );
      return existingCart.dataValues;
    },
    async decrementCartItem(parent, args, ctx, info) {
      let whereObject = {
        [Op.and]: [{ cart_id: args.cartId }, { product_id: args.productId }]
      };
      const existingCart = await ctx.db.shopping_cart.findOne({
        where: whereObject
      });
      if (!existingCart) throw new Error("No Cart Item found!");
      const cart = await ctx.db.shopping_cart.update(
        {
          quantity: existingCart.dataValues.quantity - 1
        },
        { where: whereObject },
        info
      );
      return existingCart.dataValues;
    },
    async updateCustomer(parent, args, ctx, info) {
      let whereObject = {
        [Op.and]: [{ customer_id: args.customer_id }, { email: args.email }]
      };
      const errors = [];
      if (validator.isEmpty(args.firstName)) {
        errors.push({
          message: "Please fill in your first name",
          field: "firstName"
        });
      }
      if (validator.isEmpty(args.lastName)) {
        errors.push({
          message: "Please fill in your last name",
          field: "lastName"
        });
      }
      if (validator.isEmpty(args.address)) {
        errors.push({
          message: "Please fill in your address",
          field: "address"
        });
      }
      if (!validator.isLength(args.address, { max: 100 })) {
        errors.push({
          message: "Address field too long. Only 100 characters allowed.",
          field: "address"
        });
      }
      if (validator.isEmpty(args.city)) {
        errors.push({ message: "Please fill in your city", field: "city" });
      }
      if (validator.isEmpty(args.region)) {
        errors.push({
          message: "Please fill in your state or region",
          field: "state"
        });
      }
      if (validator.isEmpty(args.country)) {
        errors.push({
          message: "Please fill in your country",
          field: "country"
        });
      }
      if (
        validator.isEmpty(args.zipCode) ||
        !validator.isLength(args.zipCode, { min: 4, max: 6 })
      ) {
        errors.push({
          message: "Please provide a valid Zip Code",
          field: "zipcode"
        });
      }
      if (args.shippingRegion === 1) {
        errors.push({ message: "Please choose a shipping region", field: "shipping" });
      }
      if (args.shippingType === 0) {
        errors.push({ message: "Please choose a shipping type", field: "shipping" });
      }
      if (errors.length > 0) {
        const error = new Error("Invalid input.");
        error.data = errors;
        error.code = 422;
        throw error;
      }
      const existingCustomer = await ctx.db.customer.findOne({
        where: whereObject
      });
      if (!existingCustomer) {
        throw new Error("No user found for that email...");
      }
      const customer = await ctx.db.customer.update(
        {
          name: `${args.firstName} ${args.lastName}`,
          address_1: args.address,
          city: args.city,
          region: args.region,
          postal_code: args.zipCode,
          country: args.country,
          shipping_region_id: args.shippingRegion
        },
        {
          where: whereObject
        },
        info
      );
      return existingCustomer.dataValues;
    },
    async createOrder(parent, args, ctx, info) {
      const customerId = ctx.customerId;
      if (!customerId)
        throw new Error("You must be signed in to complete the order...");

      const cartItems = await ctx.db.shopping_cart.findAll({
        where: { cart_id: args.cartId },
        include: [{ model: ctx.db.product }]
      });
      if (!cartItems) throw new Error("No cart found for this order...");

      const shippingCost = await ctx.db.shipping.findOne({
        where: { shipping_id: args.shippingId }
      });

      const totalItemsCost = cartItems.reduce(
        (tally, cartItem) =>
          tally +
          pickPrice(cartItem.product.price, cartItem.product.discounted_price) *
            cartItem.quantity,
        0
      );

      const amount = round(
        parseFloat(shippingCost.shipping_cost) + parseFloat(totalItemsCost),
        2
      );

      console.log(round(amount, 2));

      const order = await ctx.db.orders.create(
        {
          total_amount: amount,
          customer_id: customerId,
          auth_code: args.authCode,
          shipping_id: args.shippingId,
          tax_id: 2
        },
        info
      );

      const orderItems = cartItems.map(cartItem => {
        const orderItem = {
          order_id: order.order_id,
          product_id: cartItem.product.product_id,
          attributes: cartItem.attributes,
          product_name: cartItem.product.name,
          quantity: cartItem.quantity,
          unit_cost: pickPrice(
            cartItem.product.price,
            cartItem.product.discounted_price
          )
        };
        return orderItem;
      });

      const createOrderDetails = await ctx.db.order_detail.bulkCreate(
        orderItems
      );

      const charge = await stripe.charges.create({
        amount: amount * 100,
        currency: "USD",
        source: args.authCode,
        metadata: { order_id: `${order.order_id}` }
      });

      if (charge.status === "succeeded") {
        const updateOrderStatus = await ctx.db.orders.update(
          {
            status: 1,
            reference: charge.id
          },
          {
            where: {
              [Op.and]: [
                { order_id: order.order_id },
                { customer_id: customerId }
              ]
            }
          },
          info
        );
      };

      const deleteCart = await ctx.db.shopping_cart.destroy(
        {
          where: { cart_id: args.cartId }
        },
        info
      );

      return order;
    }
  }
};
