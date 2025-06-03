import { User, CreateUserBody, UpdateUserBody, UserResponse, DeleteUserResponse } from '../types/user.types';
import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcrypt';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Obtém todos os usuários
   * @returns Promise<User[]> - Lista de usuários
   */
  async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.findAll();
    return users.map(user => ({
      id: user.id,
      email: user.email,
      nome: user.nome
    }));
  }

  /**
   * Atualiza um usuário existente
   * @param id - ID do usuário
   * @param data - Dados para atualização
   * @returns Promise<UserResponse> - Dados do usuário atualizado
   * @throws {Error} - Erro caso o usuário não seja encontrado
   */
  async updateUser(id: string, data: UpdateUserBody): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await this.userRepository.update(id, data);
    if (!updatedUser) {
      throw new Error('Erro ao atualizar usuário');
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      nome: updatedUser.nome
    };
  }

  /**
   * Remove um usuário
   * @param id - ID do usuário
   * @returns Promise<DeleteUserResponse> - Confirmação da remoção
   * @throws {Error} - Erro caso o usuário não seja encontrado
   */
  async deleteUser(id: string): Promise<DeleteUserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    await this.userRepository.delete(id);
    return {
      message: 'Usuário removido com sucesso',
      id
    };
  }

  /**
   * Cria um novo usuário
   * @param data - Dados do usuário
   * @returns Promise<UserResponse> - Dados do usuário criado
   */
  async createUser(data: CreateUserBody): Promise<UserResponse> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword
    });

    return {
      id: user.id,
      email: user.email,
      nome: user.nome
    };
  }

  /**
   * Obtém um usuário pelo ID
   * @param id - ID do usuário
   * @returns Promise<UserResponse> - Dados do usuário
   * @throws {Error} - Erro caso o usuário não seja encontrado
   */
  async getUserById(id: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      nome: user.nome
    };
  }

  /**
   * Obtém um usuário pelo email
   * @param email - Email do usuário
   * @returns Promise<User | null> - Dados do usuário ou null se não encontrado
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }
} 