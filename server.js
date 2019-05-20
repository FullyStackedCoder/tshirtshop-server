const path = require("path");

const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
require("dotenv").config({ path: "variables.env" });
import typeDefs from "./graphql/schema";
import resolvers from "./graphql/resolvers";
import db from "./models";

const server = new ApolloServer({
  typeDefs: gql(typeDefs),
  resolvers,formatError: (err) => {
    if (!err.originalError) {
      return err;
    }
    const data = err.originalError.data;
    const message = err.message || 'An error occurred.';
    const code = err.originalError.code || 500;
    return { message: message, status: code, data: data };
  },
  context: async ({ req }) => ({
    ...req,
    db
  }),
  // validationRules: [depthLimit(strapi.plugins.graphql.config.depthLimit)],
  playground: true,
  introspection: true // add this param
});

const app = express();
app.set('port', (process.env.PORT || 4000));

const corsOptions = {
  credentials: true,
  origin: process.env.FRONTEND_URL
};

app.use(cookieParser());

app.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { customerId } = jwt.verify(token, process.env.APP_SECRET);
    req.customerId = customerId;
  }
  next();
});

app.use(async (req, res, next) => {
  if (!req.customerId) return next();
  const customer = await db.customer.findOne(
    { where: { customer_id: req.customerId } },
    "{ customer_id, email, name }"
  );
  req.customer = customer;
  next();
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, PUT, POST, DELETE, PATCH"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/images", express.static(path.join(__dirname, "images")));

server.applyMiddleware({ app, cors: corsOptions });

db.sequelize.sync().then(() => {
  app.listen(app.get('port'), () =>
    console.log(`� Server ready at http://localhost:${app.get('port')}${server.graphqlPath}`)
  );
});
