"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// /src/config/jwt.ts
const fastify_jwt_1 = __importDefault(require("fastify-jwt"));
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
exports.default = (0, fastify_plugin_1.default)(async (fastify) => {
    fastify.register(fastify_jwt_1.default, {
        secret: process.env.JWT_SECRET,
    });
    fastify.decorate('authenticate', async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            reply.send(err);
        }
    });
});
