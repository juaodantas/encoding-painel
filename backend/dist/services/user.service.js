"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserService {
    constructor() {
        this.userRepository = new user_repository_1.UserRepository();
    }
    /**
     * Obtém todos os usuários
     * @returns Promise<User[]> - Lista de usuários
     */
    async getAllUsers() {
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
    async updateUser(id, data) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        if (data.password) {
            data.password = await bcrypt_1.default.hash(data.password, 10);
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
    async deleteUser(id) {
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
    async createUser(data) {
        const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
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
    async getUserById(id) {
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
    async getUserByEmail(email) {
        return await this.userRepository.findByEmail(email);
    }
}
exports.UserService = UserService;
