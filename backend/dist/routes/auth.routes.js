"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
const auth_controller_1 = require("../controllers/auth.controller");
async function authRoutes(fastify) {
    fastify.post('/auth/register', {
        schema: auth_controller_1.authSchemas.register
    }, auth_controller_1.register);
    fastify.post('/auth/login', {
        schema: auth_controller_1.authSchemas.login
    }, auth_controller_1.login);
}
