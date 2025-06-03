import { FastifyInstance } from 'fastify';
import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RegisterResponse, LoginResponse, AuthError } from '../types/auth.types';

export class AuthService {
  private userRepository: UserRepository;

  constructor(private readonly fastify: FastifyInstance) {
    this.userRepository = new UserRepository();
  }

  /**
   * Registra um novo usuário
   * @param email - Email do usuário
   * @param password - Senha do usuário
   * @param nome - Nome do usuário
   * @returns Promise<RegisterResponse> - Dados do usuário registrado
   * @throws {AuthError} - Erro caso o registro falhe
   */
  async register(email: string, password: string, nome: string): Promise<RegisterResponse> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      const error: AuthError = {
        message: 'Email já cadastrado',
        code: 'EMAIL_EXISTS'
      };
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      nome
    });

    return {
      message: 'Usuário registrado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome
      }
    };
  }

  /**
   * Autentica um usuário
   * @param email - Email do usuário
   * @param password - Senha do usuário
   * @returns Promise<LoginResponse> - Token JWT e dados do usuário
   * @throws {AuthError} - Erro caso a autenticação falhe
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      const error: AuthError = {
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      };
      throw error;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      const error: AuthError = {
        message: 'Senha inválida',
        code: 'INVALID_PASSWORD'
      };
      throw error;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome
      }
    };
  }
} 