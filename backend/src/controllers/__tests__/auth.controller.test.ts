import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../../services/auth.service';
import { register, login } from '../auth.controller';
import { RegisterDTO } from '../../dtos/auth/register.dto';
import { LoginDTO } from '../../dtos/auth/login.dto';

// Mock do AuthService
jest.mock('../../services/auth.service');

describe('AuthController', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockAuthService: jest.Mocked<AuthService>;

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
      } as any,
      body: {},
    };

    mockReply = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    // Configura o mock do AuthService
    mockAuthService = new AuthService(mockRequest.server as any) as jest.Mocked<AuthService>;
    (AuthService as jest.Mock).mockImplementation(() => mockAuthService);
  });

  describe('register', () => {
    const mockRegisterData: RegisterDTO = {
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
      const result = await register(
        mockRequest as FastifyRequest<{ Body: RegisterDTO }>,
        mockReply as FastifyReply
      );

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        mockRegisterData.email,
        mockRegisterData.password,
        mockRegisterData.nome
      );
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
      await expect(
        register(
          mockRequest as FastifyRequest<{ Body: RegisterDTO }>,
          mockReply as FastifyReply
        )
      ).rejects.toEqual(mockError);
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ message: mockError.message });
    });
  });

  describe('login', () => {
    const mockLoginData: LoginDTO = {
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
      const result = await login(
        mockRequest as FastifyRequest<{ Body: LoginDTO }>,
        mockReply as FastifyReply
      );

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockLoginData.email,
        mockLoginData.password
      );
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
      await expect(
        login(
          mockRequest as FastifyRequest<{ Body: LoginDTO }>,
          mockReply as FastifyReply
        )
      ).rejects.toEqual(mockError);
      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({ message: mockError.message });
    });
  });
}); 