"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    constructor(fastify) {
        this.fastify = fastify;
        this.userRepository = new user_repository_1.UserRepository();
    }
    /**
     * Registra um novo usuário
     * @param email - Email do usuário
     * @param password - Senha do usuário
     * @param nome - Nome do usuário
     * @returns Promise<RegisterResponse> - Dados do usuário registrado
     * @throws {AuthError} - Erro caso o registro falhe
     */
    async register(email, password, nome) {
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            const error = {
                message: 'Email já cadastrado',
                code: 'EMAIL_EXISTS'
            };
            throw error;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
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
    async login(email, password) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            const error = {
                message: 'Usuário não encontrado',
                code: 'USER_NOT_FOUND'
            };
            throw error;
        }
        const validPassword = await bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            const error = {
                message: 'Senha inválida',
                code: 'INVALID_PASSWORD'
            };
            throw error;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1d' });
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
exports.AuthService = AuthService;
