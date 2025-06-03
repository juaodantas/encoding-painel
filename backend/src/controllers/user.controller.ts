import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/user.service';
import { User, CreateUserBody, UpdateUserBody, UserResponse, DeleteUserResponse, UserError } from '../types/user.types';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Obtém todos os usuários
   * @param request - Requisição do Fastify
   * @param reply - Resposta do Fastify
   * @returns Promise<User[]> - Lista de usuários
   * @throws {UserError} - Erro caso a operação falhe
   */
  async getAllUsers(request: FastifyRequest, reply: FastifyReply): Promise<User[]> {
    try {
      const users = await this.userService.getAllUsers();
      reply.send(users);
      return users;
    } catch (error: any) {
      const userError: UserError = {
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
  async updateUser(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateUserBody;
    }>,
    reply: FastifyReply
  ): Promise<UserResponse> {
    try {
      const user = await this.userService.updateUser(request.params.id, request.body);
      reply.send(user);
      return user;
    } catch (error: any) {
      const userError: UserError = {
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
  async deleteUser(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<DeleteUserResponse> {
    try {
      const result = await this.userService.deleteUser(request.params.id);
      reply.send(result);
      return result;
    } catch (error: any) {
      const userError: UserError = {
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
  async createUser(
    request: FastifyRequest<{ Body: CreateUserBody }>,
    reply: FastifyReply
  ): Promise<UserResponse> {
    try {
      const { email, password, nome } = request.body;

      if (!email || !password || !nome) {
        const userError: UserError = {
          message: 'Email, senha e nome são obrigatórios',
          code: 'INVALID_DATA'
        };
        reply.status(400).send(userError);
        throw userError;
      }

      const user = await this.userService.createUser({ email, password, nome });
      reply.status(201).send(user);
      return user;
    } catch (error: any) {
      const userError: UserError = {
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
  async getUserById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<UserResponse> {
    try {
      const { id } = request.params;
      const user = await this.userService.getUserById(id);

      if (!user) {
        const userError: UserError = {
          message: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND'
        };
        reply.status(404).send(userError);
        throw userError;
      }

      reply.send(user);
      return user;
    } catch (error: any) {
      const userError: UserError = {
        message: error.message,
        code: error.code || 'SERVER_ERROR'
      };
      reply.status(userError.code === 'USER_NOT_FOUND' ? 404 : 500).send(userError);
      throw userError;
    }
  }
} 