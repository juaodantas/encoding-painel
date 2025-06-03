import { FastifySchema } from 'fastify';
import { CreateUserBody } from '../../types/user.types';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;

export const createUserSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['email', 'password', 'nome'],
    properties: {
      email: { 
        type: 'string', 
        format: 'email',
        pattern: emailRegex.source,
        minLength: 5,
        maxLength: 255
      },
      password: { 
        type: 'string',
        pattern: passwordRegex.source,
        minLength: 6,
        maxLength: 100
      },
      nome: { 
        type: 'string',
        minLength: 3,
        maxLength: 100
      }
    }
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        nome: { type: 'string' }
      }
    },
    400: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        code: { type: 'string' }
      }
    }
  }
}; 