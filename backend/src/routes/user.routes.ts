import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/user.controller';
import { createUserSchema } from '../dtos/user/create-user.dto';
import { updateUserSchema } from '../dtos/user/update-user.dto';
import { 
  userListResponseSchema, 
  userResponseSchema, 
  errorResponseSchema, 
  deleteUserResponseSchema 
} from '../dtos/user/user-response.dto';

export default async function userRoutes(fastify: FastifyInstance) {
  const userController = new UserController();

  // Get all users
  fastify.get('/users', {
    schema: {
      tags: ['users'],
      summary: 'Listar todos os usuários',
      security: [{ bearerAuth: [] }],
      response: {
        200: userListResponseSchema,
        500: errorResponseSchema
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
        200: userResponseSchema,
        404: errorResponseSchema
      }
    }
  }, userController.getUserById.bind(userController));

  // Create user
  fastify.post('/users', {
    schema: createUserSchema
  }, userController.createUser.bind(userController));

  // Update user
  fastify.put('/users/:id', {
    schema: updateUserSchema
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
        200: deleteUserResponseSchema,
        404: errorResponseSchema
      }
    }
  }, userController.deleteUser.bind(userController));
} 