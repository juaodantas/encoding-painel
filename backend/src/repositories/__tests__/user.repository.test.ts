import { UserRepository } from '../user.repository';
import { User } from '../../models/user.model';

// Mock do modelo User
jest.mock('../../models/user.model', () => ({
  User: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  }
}));

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockUser: any;

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();

    // Configura o mock do usuário
    mockUser = {
      id: '1',
      email: 'test@example.com',
      nome: 'Test User',
      password: 'hashed_password',
      update: jest.fn(),
      destroy: jest.fn()
    };

    userRepository = new UserRepository();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      // Arrange
      const mockUsers = [mockUser];
      (User.findAll as jest.Mock).mockResolvedValue(mockUsers);

      // Act
      const result = await userRepository.findAll();

      // Assert
      expect(result).toEqual(mockUsers);
      expect(User.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      // Arrange
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await userRepository.findById('1');

      // Assert
      expect(result).toEqual(mockUser);
      expect(User.findByPk).toHaveBeenCalledWith('1');
    });

    it('should return null when user is not found', async () => {
      // Arrange
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await userRepository.findById('1');

      // Assert
      expect(result).toBeNull();
      expect(User.findByPk).toHaveBeenCalledWith('1');
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      // Arrange
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await userRepository.findByEmail('test@example.com');

      // Assert
      expect(result).toEqual(mockUser);
      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
    });

    it('should return null when user is not found', async () => {
      // Arrange
      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await userRepository.findByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' }
      });
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      // Arrange
      const userData = {
        email: 'new@example.com',
        nome: 'New User',
        password: 'password123'
      };
      (User.create as jest.Mock).mockResolvedValue({
        id: '2',
        ...userData
      });

      // Act
      const result = await userRepository.create(userData);

      // Assert
      expect(result).toEqual({
        id: '2',
        ...userData
      });
      expect(User.create).toHaveBeenCalledWith(userData);
    });
  });

  describe('update', () => {
    it('should update user when found', async () => {
      // Arrange
      const updateData = {
        nome: 'Updated Name',
        email: 'updated@example.com'
      };

      // Cria um novo objeto mock para o usuário atualizado
      const updatedUser = {
        ...mockUser,
        ...updateData
      };

      // Configura o mock para retornar o usuário atualizado
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      mockUser.update.mockImplementation(() => {
        Object.assign(mockUser, updateData);
        return Promise.resolve(mockUser);
      });

      // Act
      const result = await userRepository.update('1', updateData);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(User.findByPk).toHaveBeenCalledWith('1');
      expect(mockUser.update).toHaveBeenCalledWith(updateData);
    });

    it('should return null when user is not found', async () => {
      // Arrange
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await userRepository.update('1', { nome: 'New Name' });

      // Assert
      expect(result).toBeNull();
      expect(User.findByPk).toHaveBeenCalledWith('1');
    });
  });

  describe('delete', () => {
    it('should delete user when found', async () => {
      // Arrange
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      mockUser.destroy.mockResolvedValue(true);

      // Act
      const result = await userRepository.delete('1');

      // Assert
      expect(result).toEqual({ message: 'Usuário deletado com sucesso' });
      expect(User.findByPk).toHaveBeenCalledWith('1');
      expect(mockUser.destroy).toHaveBeenCalled();
    });

    it('should throw error when user is not found', async () => {
      // Arrange
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(userRepository.delete('1')).rejects.toThrow('Usuário não encontrado');
      expect(User.findByPk).toHaveBeenCalledWith('1');
    });
  });
}); 