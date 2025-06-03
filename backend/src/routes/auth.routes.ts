import { FastifyInstance } from 'fastify';
import { login, register, authSchemas } from '../controllers/auth.controller';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/register', {
    schema: authSchemas.register
  }, register);

  fastify.post('/auth/login', {
    schema: authSchemas.login
  }, login);
} 