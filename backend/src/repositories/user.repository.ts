import { User, UserCreationAttributes } from '../models/user.model';

export class UserRepository {
  async findAll() {
    return User.findAll();
  }

  async findById(id: string) {
    return await User.findByPk(id);
  }

  async findByEmail(email: string) {
    return await User.findOne({ where: { email } });
  }

  async create(userData: UserCreationAttributes) {
    return await User.create(userData);
  }

  async update(id: string, data: Partial<UserCreationAttributes>) {
    const user = await User.findByPk(id);
    if (user) {
      await user.update(data);
      return user;
    }
    return null;
  }

  async delete(id: string) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    await user.destroy();
    return { message: 'Usuário deletado com sucesso' };
  }
} 