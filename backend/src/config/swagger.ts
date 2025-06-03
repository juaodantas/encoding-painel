import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export async function setupSwagger(server: FastifyInstance) {
  // Configuração do Swagger
  await server.register(swagger, {
    openapi: {
      info: {
        title: 'Encoding video API',
        description: 'API para sistema de recomendação de filmes',
        version: '1.0.0'
      },
      servers: [
        {
          url: 'http://localhost:3001',
          description: 'Servidor de desenvolvimento'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    }
  });

  // Configuração do Swagger UI
  await server.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    }
  });

  // Schemas compartilhados
  server.addSchema({
    $id: 'auth.register',
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 }
    }
  });

  server.addSchema({
    $id: 'auth.login',
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' }
    }
  });

  server.addSchema({
    $id: 'user.update',
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 }
    }
  });

  server.addSchema({
    $id: 'error',
    type: 'object',
    properties: {
      message: { type: 'string' }
    }
  });

  const userSchema = {
    $id: 'user',
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      email: { type: 'string', format: 'email' },
      nome: { type: 'string' },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    }
  };

  const userCreateSchema = {
    $id: 'user.create',
    type: 'object',
    required: ['email', 'password', 'nome'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 },
      nome: { type: 'string', minLength: 3 }
    }
  };

  server.addSchema(userSchema);
  server.addSchema(userCreateSchema);

  server.addSchema({
    $id: 'users',
    type: 'array',
    items: { $ref: 'user#' }
  });

  server.addSchema({
    $id: 'auth.register.response',
    type: 'object',
    properties: {
      message: { type: 'string' },
      user: { $ref: 'user#' }
    }
  });

  server.addSchema({
    $id: 'auth.login.response',
    type: 'object',
    properties: {
      token: { type: 'string' }
    }
  });

  server.addSchema({
    $id: 'video',
    type: 'object',
    properties: {
      id: { type: 'string' },
      titulo: { type: 'string' },
      descricao: { type: 'string' },
      status: { type: 'string', enum: ['uploaded', 'processing', 'done', 'error'] },
      originalUrl: { type: 'string' },
      processedUrl_720p: { type: 'string' },
      processedUrl_480p: { type: 'string' },
      dataUpload: { type: 'string', format: 'date-time' },
      usuarioCriadorId: { type: 'string' },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    }
  });
} 