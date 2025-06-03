"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_controller_1 = require("../user.controller");
const user_service_1 = require("../../services/user.service");
// Mock do UserService
jest.mock('../../services/user.service');
describe('UserController', () => {
    let userController;
    let mockRequest;
    let mockReply;
    let mockUserService;
    beforeEach(() => {
        // Limpa todos os mocks antes de cada teste
        jest.clearAllMocks();
        // Configura o mock do Fastify
        mockRequest = {
            body: {},
            params: {},
        };
        mockReply = {
            send: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        // Configura o mock do UserService
        mockUserService = new user_service_1.UserService();
        user_service_1.UserService.mockImplementation(() => mockUserService);
        userController = new user_controller_1.UserController();
    });
    describe('getAllUsers', () => {
        it('should return all users successfully', async () => {
            // Arrange
            const mockUsers = [
                { id: '1', email: 'user1@test.com', nome: 'User 1' },
                { id: '2', email: 'user2@test.com', nome: 'User 2' }
            ];
            mockUserService.getAllUsers.mockResolvedValue(mockUsers);
            // Act
            const result = await userController.getAllUsers(mockRequest, mockReply);
            // Assert
            expect(result).toEqual(mockUsers);
            expect(mockUserService.getAllUsers).toHaveBeenCalled();
            expect(mockReply.send).toHaveBeenCalledWith(mockUsers);
        });
        it('should handle error when getting all users', async () => {
            // Arrange
            const mockError = {
                message: 'Erro ao buscar usuários',
                code: 'SERVER_ERROR'
            };
            mockUserService.getAllUsers.mockRejectedValue(mockError);
            // Act & Assert
            await expect(userController.getAllUsers(mockRequest, mockReply)).rejects.toEqual(mockError);
            expect(mockReply.status).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith(mockError);
        });
    });
    describe('createUser', () => {
        const mockCreateData = {
            email: 'new@test.com',
            password: 'password123',
            nome: 'New User'
        };
        it('should create user successfully', async () => {
            // Arrange
            mockRequest.body = mockCreateData;
            const mockResponse = {
                id: '1',
                email: mockCreateData.email,
                nome: mockCreateData.nome
            };
            mockUserService.createUser.mockResolvedValue(mockResponse);
            // Act
            const result = await userController.createUser(mockRequest, mockReply);
            // Assert
            expect(result).toEqual(mockResponse);
            expect(mockUserService.createUser).toHaveBeenCalledWith(mockCreateData);
            expect(mockReply.status).toHaveBeenCalledWith(201);
            expect(mockReply.send).toHaveBeenCalledWith(mockResponse);
        });
        it('should handle missing required fields', async () => {
            // Arrange
            mockRequest.body = { email: 'test@test.com' }; // Missing password and nome
            const mockError = {
                message: 'Email, senha e nome são obrigatórios',
                code: 'INVALID_DATA'
            };
            mockUserService.createUser.mockRejectedValue(mockError);
            // Act & Assert
            await expect(userController.createUser(mockRequest, mockReply)).rejects.toMatchObject({
                message: 'Email, senha e nome são obrigatórios',
                code: 'INVALID_DATA'
            });
            expect(mockReply.status).toHaveBeenCalledWith(400);
        });
    });
    describe('updateUser', () => {
        const mockUpdateData = {
            email: 'updated@test.com',
            password: 'newpassword123'
        };
        it('should update user successfully', async () => {
            // Arrange
            mockRequest.params = { id: '1' };
            mockRequest.body = mockUpdateData;
            const mockResponse = {
                id: '1',
                email: 'updated@test.com',
                nome: 'Test User'
            };
            mockUserService.updateUser.mockResolvedValue(mockResponse);
            // Act
            const result = await userController.updateUser(mockRequest, mockReply);
            // Assert
            expect(result).toEqual(mockResponse);
            expect(mockUserService.updateUser).toHaveBeenCalledWith('1', mockUpdateData);
            expect(mockReply.send).toHaveBeenCalledWith(mockResponse);
        });
        it('should handle user not found', async () => {
            // Arrange
            mockRequest.params = { id: '999' };
            mockRequest.body = mockUpdateData;
            const mockError = {
                message: 'Usuário não encontrado',
                code: 'USER_NOT_FOUND'
            };
            mockUserService.updateUser.mockRejectedValue(mockError);
            // Act & Assert
            await expect(userController.updateUser(mockRequest, mockReply)).rejects.toEqual(mockError);
            expect(mockReply.status).toHaveBeenCalledWith(404);
        });
    });
    describe('deleteUser', () => {
        it('should delete user successfully', async () => {
            // Arrange
            mockRequest.params = { id: '1' };
            const mockResponse = {
                message: 'Usuário removido com sucesso',
                id: '1'
            };
            mockUserService.deleteUser.mockResolvedValue(mockResponse);
            // Act
            const result = await userController.deleteUser(mockRequest, mockReply);
            // Assert
            expect(result).toEqual(mockResponse);
            expect(mockUserService.deleteUser).toHaveBeenCalledWith('1');
            expect(mockReply.send).toHaveBeenCalledWith(mockResponse);
        });
        it('should handle user not found', async () => {
            // Arrange
            mockRequest.params = { id: '999' };
            const mockError = {
                message: 'Usuário não encontrado',
                code: 'USER_NOT_FOUND'
            };
            mockUserService.deleteUser.mockRejectedValue(mockError);
            // Act & Assert
            await expect(userController.deleteUser(mockRequest, mockReply)).rejects.toEqual(mockError);
            expect(mockReply.status).toHaveBeenCalledWith(404);
        });
    });
    describe('getUserById', () => {
        it('should get user successfully', async () => {
            // Arrange
            mockRequest.params = { id: '1' };
            const mockResponse = {
                id: '1',
                email: 'test@test.com',
                nome: 'Test User'
            };
            mockUserService.getUserById.mockResolvedValue(mockResponse);
            // Act
            const result = await userController.getUserById(mockRequest, mockReply);
            // Assert
            expect(result).toEqual(mockResponse);
            expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
            expect(mockReply.send).toHaveBeenCalledWith(mockResponse);
        });
        it('should handle user not found', async () => {
            // Arrange
            mockRequest.params = { id: '999' };
            const mockError = {
                message: 'Usuário não encontrado',
                code: 'USER_NOT_FOUND'
            };
            mockUserService.getUserById.mockRejectedValue(mockError);
            // Act & Assert
            await expect(userController.getUserById(mockRequest, mockReply)).rejects.toMatchObject({
                message: 'Usuário não encontrado',
                code: 'USER_NOT_FOUND'
            });
            expect(mockReply.status).toHaveBeenCalledWith(404);
        });
    });
});
