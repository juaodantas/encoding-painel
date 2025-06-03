"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authSchemas = exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const register_dto_1 = require("../dtos/auth/register.dto");
const login_dto_1 = require("../dtos/auth/login.dto");
/**
 * Registra um novo usuário no sistema
 * @param request - Requisição contendo email, senha e nome do usuário
 * @param reply - Resposta do Fastify
 * @returns Promise<RegisterResponse> - Dados do usuário registrado
 * @throws {Error} - Erro caso o registro falhe
 */
const register = async (request, reply) => {
    const { email, password, nome } = request.body;
    const authService = new auth_service_1.AuthService(request.server);
    try {
        const result = await authService.register(email, password, nome);
        reply.send(result);
        return result;
    }
    catch (error) {
        reply.status(400).send({ message: error.message });
        throw error;
    }
};
exports.register = register;
/**
 * Autentica um usuário no sistema
 * @param request - Requisição contendo email e senha do usuário
 * @param reply - Resposta do Fastify
 * @returns Promise<LoginResponse> - Token JWT e dados do usuário
 * @throws {Error} - Erro caso a autenticação falhe
 */
const login = async (request, reply) => {
    const { email, password } = request.body;
    const authService = new auth_service_1.AuthService(request.server);
    try {
        const result = await authService.login(email, password);
        reply.send(result);
        return result;
    }
    catch (error) {
        reply.status(401).send({ message: error.message });
        throw error;
    }
};
exports.login = login;
exports.authSchemas = {
    register: register_dto_1.registerSchema,
    login: login_dto_1.loginSchema
};
