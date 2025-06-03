"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
class UserController {
    constructor() {
        this.userService = new user_service_1.UserService();
    }
    /**
     * Obtém todos os usuários
     * @param request - Requisição do Fastify
     * @param reply - Resposta do Fastify
     * @returns Promise<User[]> - Lista de usuários
     * @throws {UserError} - Erro caso a operação falhe
     */
    async getAllUsers(request, reply) {
        try {
            const users = await this.userService.getAllUsers();
            reply.send(users);
            return users;
        }
        catch (error) {
            const userError = {
                message: error.message,
                code: error.code || 'SERVER_ERROR'
            };
            reply.status(userError.code === 'INVALID_DATA' ? 400 : 500).send(userError);
            throw userError;
        }
    }
    /**
     * Atualiza um usuário existente
     * @param request - Requisição contendo ID e dados do usuário
     * @param reply - Resposta do Fastify
     * @returns Promise<UserResponse> - Dados do usuário atualizado
     * @throws {UserError} - Erro caso a operação falhe
     */
    async updateUser(request, reply) {
        try {
            const user = await this.userService.updateUser(request.params.id, request.body);
            reply.send(user);
            return user;
        }
        catch (error) {
            const userError = {
                message: error.message,
                code: error.code || 'SERVER_ERROR'
            };
            reply.status(userError.code === 'USER_NOT_FOUND' ? 404 :
                userError.code === 'INVALID_DATA' ? 400 : 500).send(userError);
            throw userError;
        }
    }
    /**
     * Remove um usuário
     * @param request - Requisição contendo ID do usuário
     * @param reply - Resposta do Fastify
     * @returns Promise<DeleteUserResponse> - Confirmação da remoção
     * @throws {UserError} - Erro caso a operação falhe
     */
    async deleteUser(request, reply) {
        try {
            const result = await this.userService.deleteUser(request.params.id);
            reply.send(result);
            return result;
        }
        catch (error) {
            const userError = {
                message: error.message,
                code: error.code || 'SERVER_ERROR'
            };
            reply.status(userError.code === 'USER_NOT_FOUND' ? 404 : 500).send(userError);
            throw userError;
        }
    }
    /**
     * Cria um novo usuário
     * @param request - Requisição contendo dados do usuário
     * @param reply - Resposta do Fastify
     * @returns Promise<UserResponse> - Dados do usuário criado
     * @throws {UserError} - Erro caso a operação falhe
     */
    async createUser(request, reply) {
        try {
            const { email, password, nome } = request.body;
            if (!email || !password || !nome) {
                const userError = {
                    message: 'Email, senha e nome são obrigatórios',
                    code: 'INVALID_DATA'
                };
                reply.status(400).send(userError);
                throw userError;
            }
            const user = await this.userService.createUser({ email, password, nome });
            reply.status(201).send(user);
            return user;
        }
        catch (error) {
            const userError = {
                message: error.message,
                code: error.code || 'SERVER_ERROR'
            };
            reply.status(userError.code === 'INVALID_DATA' ? 400 : 500).send(userError);
            throw userError;
        }
    }
    /**
     * Obtém um usuário pelo ID
     * @param request - Requisição contendo ID do usuário
     * @param reply - Resposta do Fastify
     * @returns Promise<UserResponse> - Dados do usuário
     * @throws {UserError} - Erro caso a operação falhe
     */
    async getUserById(request, reply) {
        try {
            const { id } = request.params;
            const user = await this.userService.getUserById(id);
            if (!user) {
                const userError = {
                    message: 'Usuário não encontrado',
                    code: 'USER_NOT_FOUND'
                };
                reply.status(404).send(userError);
                throw userError;
            }
            reply.send(user);
            return user;
        }
        catch (error) {
            const userError = {
                message: error.message,
                code: error.code || 'SERVER_ERROR'
            };
            reply.status(userError.code === 'USER_NOT_FOUND' ? 404 : 500).send(userError);
            throw userError;
        }
    }
}
exports.UserController = UserController;
