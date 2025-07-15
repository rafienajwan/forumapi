const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt"); // <-- ADD THIS
const ClientError = require("../../Commons/exceptions/ClientError");
const DomainErrorTranslator = require("../../Commons/exceptions/DomainErrorTranslator");
const users = require("../../Interfaces/http/api/users");
const authentications = require("../../Interfaces/http/api/authentications");
const threads = require("../../Interfaces/http/api/threads");
const comments = require("../../Interfaces/http/api/comments");

const createServer = async (container) => {
  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
  });

  // REGISTER JWT PLUGIN
  await server.register(Jwt);

  // DEFINE JWT STRATEGY
  server.auth.strategy("forumapi_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts, request, h) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
        username: artifacts.decoded.payload.username,
      },
    }),
  });

  // REGISTER ROUTE PLUGINS
  await server.register([
    {
      plugin: users,
      options: { container },
    },
    {
      plugin: authentications,
      options: { container },
    },
    {
      plugin: threads,
      options: { container },
    },
    {
      plugin: comments, // <-- ADD THIS
      options: { container },
    },
  ]);

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      const translatedError = DomainErrorTranslator.translate(response);

      if (translatedError instanceof ClientError) {
        const newResponse = h.response({
          status: "fail",
          message: translatedError.message,
        });
        newResponse.code(translatedError.statusCode);
        return newResponse;
      }

      if (!translatedError.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: "error",
        message: "terjadi kegagalan pada server kami",
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  return server;
};

module.exports = createServer;
