"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("../../services/auth.service");
const auth_controller_1 = require("../auth.controller");
// Mock do AuthService
jest.mock('../../services/auth.service');
describe('AuthController', () => {
    let mockRequest;
    let mockReply;
    let mockAuthService;
    beforeEach(() => {
        // Limpa todos os mocks antes de cada teste
        jest.clearAllMocks();
        // Configura o mock do Fastify
        mockRequest = {
            server: {
                log: {
                    info: jest.fn(),
                    error: jest.fn(),
                    child: jest.fn(),
                    level: 'info',
                    fatal: jest.fn(),
                    warn: jest.fn(),
                    debug: jest.fn(),
                    trace: jest.fn(),
                    silent: jest.fn()
                }
            },
            body: {},
        };
        mockReply = {
            send: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        // Configura o mock do AuthService
        mockAuthService = new auth_service_1.AuthService(mockRequest.server);
        auth_service_1.AuthService.mockImplementation(() => mockAuthService);
    });
    describe('register', () => {
        const mockRegisterData = {
            email: 'test@example.com',
            password: 'password123',
            nome: 'Test User'
        };
        it('should register a new user successfully', async () => {
            // Arrange
            mockRequest.body = mockRegisterData;
            const mockResponse = {
                message: 'Usuário registrado com sucesso',
                user: {
                    id: '1',
                    email: mockRegisterData.email,
                    nome: mockRegisterData.nome
                }
            };
            mockAuthService.register.mockResolvedValue(mockResponse);
            // Act
            const result = await (0, auth_controller_1.register)(mockRequest, mockReply);
            // Assert
            expect(result).toEqual(mockResponse);
            expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterData.email, mockRegisterData.password, mockRegisterData.nome);
            expect(mockReply.send).toHaveBeenCalledWith(mockResponse);
        });
        it('should handle registration error', async () => {
            // Arrange
            mockRequest.body = mockRegisterData;
            const mockError = {
                message: 'Email já cadastrado',
                code: 'EMAIL_EXISTS'
            };
            mockAuthService.register.mockRejectedValue(mockError);
            // Act & Assert
            await expect((0, auth_controller_1.register)(mockRequest, mockReply)).rejects.toEqual(mockError);
            expect(mockReply.status).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({ message: mockError.message });
        });
    });
    describe('login', () => {
        const mockLoginData = {
            email: 'test@example.com',
            password: 'password123'
        };
        it('should login successfully', async () => {
            // Arrange
            mockRequest.body = mockLoginData;
            const mockResponse = {
                token: 'mock-jwt-token',
                user: {
                    id: '1',
                    email: mockLoginData.email,
                    nome: 'Test User'
                }
            };
            mockAuthService.login.mockResolvedValue(mockResponse);
            // Act
            const result = await (0, auth_controller_1.login)(mockRequest, mockReply);
            // Assert
            expect(result).toEqual(mockResponse);
            expect(mockAuthService.login).toHaveBeenCalledWith(mockLoginData.email, mockLoginData.password);
            expect(mockReply.send).toHaveBeenCalledWith(mockResponse);
        });
        it('should handle login error', async () => {
            // Arrange
            mockRequest.body = mockLoginData;
            const mockError = {
                message: 'Credenciais inválidas',
                code: 'INVALID_CREDENTIALS'
            };
            mockAuthService.login.mockRejectedValue(mockError);
            // Act & Assert
            await expect((0, auth_controller_1.login)(mockRequest, mockReply)).rejects.toEqual(mockError);
            expect(mockReply.status).toHaveBeenCalledWith(401);
            expect(mockReply.send).toHaveBeenCalledWith({ message: mockError.message });
        });
    });
});
