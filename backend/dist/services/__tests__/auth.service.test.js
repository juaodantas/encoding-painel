"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("../auth.service");
const user_repository_1 = require("../../repositories/user.repository");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Mock das dependências
jest.mock('../../repositories/user.repository');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
describe('AuthService', () => {
    let authService;
    let mockUserRepository;
    let mockFastify;
    beforeEach(() => {
        // Limpa todos os mocks antes de cada teste
        jest.clearAllMocks();
        // Configura o mock do Fastify
        mockFastify = {
            log: {
                info: jest.fn(),
                error: jest.fn(),
            },
        };
        // Configura o mock do UserRepository
        mockUserRepository = new user_repository_1.UserRepository();
        user_repository_1.UserRepository.mockImplementation(() => mockUserRepository);
        // Configura o mock do bcrypt
        bcrypt_1.default.hash.mockImplementation((password) => Promise.resolve(`hashed_${password}`));
        bcrypt_1.default.compare.mockImplementation((password, hashedPassword) => Promise.resolve(hashedPassword === `hashed_${password}`));
        // Configura o mock do jwt
        jsonwebtoken_1.default.sign.mockReturnValue('mock-jwt-token');
        authService = new auth_service_1.AuthService(mockFastify);
    });
    describe('register', () => {
        const mockRegisterData = {
            email: 'newuser@test.com',
            password: 'password123',
            nome: 'New User'
        };
        it('should register a new user successfully', async () => {
            // Arrange
            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.create.mockResolvedValue({
                id: '1',
                ...mockRegisterData,
                password: 'hashed_password123'
            });
            // Act
            const result = await authService.register(mockRegisterData.email, mockRegisterData.password, mockRegisterData.nome);
            // Assert
            expect(result).toEqual({
                message: 'Usuário registrado com sucesso',
                user: {
                    id: '1',
                    email: mockRegisterData.email,
                    nome: mockRegisterData.nome
                }
            });
            expect(bcrypt_1.default.hash).toHaveBeenCalledWith(mockRegisterData.password, 10);
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                email: mockRegisterData.email,
                password: 'hashed_password123',
                nome: mockRegisterData.nome
            });
        });
        it('should throw error when email already exists', async () => {
            // Arrange
            mockUserRepository.findByEmail.mockResolvedValue({
                id: '1',
                email: mockRegisterData.email,
                nome: 'Existing User'
            });
            // Act & Assert
            await expect(authService.register(mockRegisterData.email, mockRegisterData.password, mockRegisterData.nome)).rejects.toMatchObject({
                message: 'Email já cadastrado',
                code: 'EMAIL_EXISTS'
            });
        });
    });
    describe('login', () => {
        const mockLoginData = {
            email: 'user@test.com',
            password: 'password123'
        };
        it('should login successfully', async () => {
            // Arrange
            const mockUser = {
                id: '1',
                email: mockLoginData.email,
                nome: 'Test User',
                password: 'hashed_password123'
            };
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);
            // Act
            const result = await authService.login(mockLoginData.email, mockLoginData.password);
            // Assert
            expect(result).toEqual({
                token: 'mock-jwt-token',
                user: {
                    id: '1',
                    email: mockUser.email,
                    nome: mockUser.nome
                }
            });
            expect(bcrypt_1.default.compare).toHaveBeenCalledWith(mockLoginData.password, mockUser.password);
            expect(jsonwebtoken_1.default.sign).toHaveBeenCalledWith({ id: mockUser.id, email: mockUser.email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1d' });
        });
        it('should throw error when user is not found', async () => {
            // Arrange
            mockUserRepository.findByEmail.mockResolvedValue(null);
            // Act & Assert
            await expect(authService.login(mockLoginData.email, mockLoginData.password)).rejects.toMatchObject({
                message: 'Usuário não encontrado',
                code: 'USER_NOT_FOUND'
            });
        });
        it('should throw error when password is invalid', async () => {
            // Arrange
            const mockUser = {
                id: '1',
                email: mockLoginData.email,
                nome: 'Test User',
                password: 'wrong_hashed_password'
            };
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);
            // Act & Assert
            await expect(authService.login(mockLoginData.email, mockLoginData.password)).rejects.toMatchObject({
                message: 'Senha inválida',
                code: 'INVALID_PASSWORD'
            });
        });
    });
});
