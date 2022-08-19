const express = require("express");
const favicon = require("serve-favicon");
const http = require("http");

const {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} = require("apollo-server-core");

const { ApolloServer, gql } = require("apollo-server-express");

const typeDefs = gql`
  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book]
  }
`;

const books = [
  {
    title: "The Awakening",
    author: "Kate Chopin",
  },
  {
    title: "City of Glass",
    author: "Paul Auster",
  },
];

const resolvers = {
  Query: {
    books: () => books,
  },
};
async function startApolloServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: "bounded",
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });


  app.use(favicon(__dirname + "/favicon.ico"));
  await apolloServer.start();

  apolloServer.applyMiddleware({ app, path: "/"});
  await new Promise(resolve => httpServer.listen({ port: process.env.PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${process.env.PORT}${apolloServer.graphqlPath}`);
  return { apolloServer, app };
}

startApolloServer()
  .then(({apolloServer, app}) => { 
    console.log(
      `Server operational at: http://localhost:${process.env.PORT}${apolloServer.graphqlPath}`
    );
  })
  .catch((err) => {
    console.log(`Error occurred during server startup: ${err}`);
    process.exit(1);
  });

