# tshirtshop-server
Backend for T-Shirt Shop Application

https://tshirtshop-apollo-prod.herokuapp.com/graphql

### Tech Stack used:
1. Apollo Server Express -> for implementing Query and Mutation Resolvers, for custom server side logic, graphql endpoint and authentication
2. Sequelize -> ORM to communicate with Mysql server
3. Stripe -> for handling server side payment authentication

### How to use?
1. Clone this project somewhere you like.
2. Run - npm install - for installing the required packages.
3. Run the command - npm run dev - to start the dev server and watch for changes.
4. Run the command - npm start - to start the server in production mode.

### Challenges faced while coding this application
1. I am not used to Mysql and Sequelize. So jumping straight into using them was a bit challenging for me. I use mongoDB or prisma for my database. Using prisma is very flexible especially with apollo server and graphql.
2. Apart from the database I came into some little hurdles here and there. Like skipping the use of bcrypt for password hashing since the field length in mysql database was set to 50 characters only.

That is it for now. I will be updating this document if I remember anything else.
