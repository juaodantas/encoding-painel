import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';
import { RegisterDTO, registerSchema } from '../dtos/auth/register.dto';
import { LoginDTO, loginSchema } from '../dtos/auth/login.dto';
import { RegisterResponse, LoginResponse } from '../types/auth.types';

/**
 * Registra um novo usuário no sistema
 * @param request - Requisição contendo email, senha e nome do usuário
 * @param reply - Resposta do Fastify
 * @returns Promise<RegisterResponse> - Dados do usuário registrado
 * @throws {Error} - Erro caso o registro falhe
 */
export const register = async (
  request: FastifyRequest<{ Body: RegisterDTO }>,
  reply: FastifyReply
): Promise<RegisterResponse> => {
  const { email, password, nome } = request.body;
  const authService = new AuthService(request.server);
  
  try {
    const result = await authService.register(email, password, nome);
    reply.send(result);
    return result;
  } catch (error: any) {
    reply.status(400).send({ message: error.message });
    throw error;
  }
};

/**
 * Autentica um usuário no sistema
 * @param request - Requisição contendo email e senha do usuário
 * @param reply - Resposta do Fastify
 * @returns Promise<LoginResponse> - Token JWT e dados do usuário
 * @throws {Error} - Erro caso a autenticação falhe
 */
export const login = async (
  request: FastifyRequest<{ Body: LoginDTO }>,
  reply: FastifyReply
): Promise<LoginResponse> => {
  const { email, password } = request.body;
  const authService = new AuthService(request.server);
  
  try {
    const result = await authService.login(email, password);
    reply.send(result);
    return result;
  } catch (error: any) {
    reply.status(401).send({ message: error.message });
    throw error;
  }
};

export const authSchemas = {
  register: registerSchema,
  login: loginSchema
};