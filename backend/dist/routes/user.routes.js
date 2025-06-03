"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = userRoutes;
const user_controller_1 = require("../controllers/user.controller");
const create_user_dto_1 = require("../dtos/user/create-user.dto");
const update_user_dto_1 = require("../dtos/user/update-user.dto");
const user_response_dto_1 = require("../dtos/user/user-response.dto");
async function userRoutes(fastify) {
    const userController = new user_controller_1.UserController();
    // Get all users
    fastify.get('/users', {
        schema: {
            tags: ['users'],
            summary: 'Listar todos os usuários',
            security: [{ bearerAuth: [] }],
            response: {
                200: user_response_dto_1.userListResponseSchema,
                500: user_response_dto_1.errorResponseSchema
            }
        }
    }, userController.getAllUsers.bind(userController));
    // Get user by id
    fastify.get('/users/:id', {
        schema: {
            tags: ['users'],
            summary: 'Buscar usuário por ID',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' }
                }
            },
            response: {
                200: user_response_dto_1.userResponseSchema,
                404: user_response_dto_1.errorResponseSchema
            }
        }
    }, userController.getUserById.bind(userController));
    // Create user
    fastify.post('/users', {
        schema: create_user_dto_1.createUserSchema
    }, userController.createUser.bind(userController));
    // Update user
    fastify.put('/users/:id', {
        schema: update_user_dto_1.updateUserSchema
    }, userController.updateUser.bind(userController));
    // Delete user
    fastify.delete('/users/:id', {
        schema: {
            tags: ['users'],
            summary: 'Deletar usuário',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' }
                }
            },
            response: {
                200: user_response_dto_1.deleteUserResponseSchema,
                404: user_response_dto_1.errorResponseSchema
            }
        }
    }, userController.deleteUser.bind(userController));
}
