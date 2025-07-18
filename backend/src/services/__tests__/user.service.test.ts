import { UserService } from '../user.service';
import { UserRepository } from '../../repositories/user.repository';
import bcrypt from 'bcrypt';
import { CreateUserBody, UpdateUserBody } from '../../types/user.types';

// Mock das dependências
jest.mock('../../repositories/user.repository');
jest.mock('bcrypt');

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();

    // Configura o mock do UserRepository
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    (UserRepository as jest.Mock).mockImplementation(() => mockUserRepository);

    // Configura o mock do bcrypt
    (bcrypt.hash as jest.Mock).mockImplementation((password) => Promise.resolve(`hashed_${password}`));

    userService = new UserService();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      // Arrange
      const mockUsers = [
        { id: '1', email: 'user1@test.com', nome: 'User 1', password: 'hashed_pass' },
        { id: '2', email: 'user2@test.com', nome: 'User 2', password: 'hashed_pass' }
      ];

      mockUserRepository.findAll.mockResolvedValue(mockUsers as any);

      // Act
      const result = await userService.getAllUsers();

      // Assert
      expect(result).toEqual([
        { id: '1', email: 'user1@test.com', nome: 'User 1' },
        { id: '2', email: 'user2@test.com', nome: 'User 2' }
      ]);
      expect(mockUserRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    const mockCreateUserData: CreateUserBody = {
      email: 'newuser@test.com',
      nome: 'New User',
      password: 'password123'
    };

    it('should create a new user successfully', async () => {
      // Arrange
      const mockCreatedUser = {
        id: '3',
        ...mockCreateUserData,
        password: 'hashed_password123'
      };

      mockUserRepository.create.mockResolvedValue(mockCreatedUser as any);

      // Act
      const result = await userService.createUser(mockCreateUserData);

      // Assert
      expect(result).toEqual({
        id: '3',
        email: mockCreateUserData.email,
        nome: mockCreateUserData.nome
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockCreateUserData.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...mockCreateUserData,
        password: 'hashed_password123'
      });
    });
  });

  describe('updateUser', () => {
    const mockUpdateData: UpdateUserBody = {
      email: 'updated@test.com',
      password: 'newpassword123'
    };

    it('should update user successfully', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        email: 'user@test.com',
        nome: 'Old Name',
        password: 'old_hashed_pass'
      };

      const mockUpdatedUser = {
        ...mockUser,
        email: mockUpdateData.email,
        password: 'hashed_newpassword123'
      };

      mockUserRepository.findById.mockResolvedValue(mockUser as any);
      mockUserRepository.update.mockResolvedValue(mockUpdatedUser as any);

      // Act
      const result = await userService.updateUser('1', mockUpdateData);

      // Assert
      expect(result).toEqual({
        id: '1',
        email: mockUpdateData.email,
        nome: mockUser.nome
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(mockUserRepository.update).toHaveBeenCalledWith('1', {
        email: mockUpdateData.email,
        password: 'hashed_newpassword123'
      });
    });

    it('should throw error when user is not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.updateUser('1', mockUpdateData))
        .rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        email: 'user@test.com',
        nome: 'Test User'
      };

      mockUserRepository.findById.mockResolvedValue(mockUser as any);
      mockUserRepository.delete.mockResolvedValue({ message: 'Usuário deletado com sucesso' });

      // Act
      const result = await userService.deleteUser('1');

      // Assert
      expect(result).toEqual({
        message: 'Usuário removido com sucesso',
        id: '1'
      });
      expect(mockUserRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw error when user is not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.deleteUser('1'))
        .rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        email: 'user@test.com',
        nome: 'Test User',
        password: 'hashed_pass'
      };

      mockUserRepository.findById.mockResolvedValue(mockUser as any);

      // Act
      const result = await userService.getUserById('1');

      // Assert
      expect(result).toEqual({
        id: '1',
        email: mockUser.email,
        nome: mockUser.nome
      });
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw error when user is not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById('1'))
        .rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('getUserByEmail', () => {
    it('should return user when found', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        email: 'user@test.com',
        nome: 'Test User',
        password: 'hashed_pass'
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);

      // Act
      const result = await userService.getUserByEmail('user@test.com');

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('user@test.com');
    });

    it('should return null when user is not found', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await userService.getUserByEmail('nonexistent@test.com');

      // Assert
      expect(result).toBeNull();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('nonexistent@test.com');
    });
  });
}); 