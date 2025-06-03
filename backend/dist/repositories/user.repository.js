"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const user_model_1 = require("../models/user.model");
class UserRepository {
    async findAll() {
        return user_model_1.User.findAll();
    }
    async findById(id) {
        return await user_model_1.User.findByPk(id);
    }
    async findByEmail(email) {
        return await user_model_1.User.findOne({ where: { email } });
    }
    async create(userData) {
        return await user_model_1.User.create(userData);
    }
    async update(id, data) {
        const user = await user_model_1.User.findByPk(id);
        if (user) {
            await user.update(data);
            return user;
        }
        return null;
    }
    async delete(id) {
        const user = await user_model_1.User.findByPk(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        await user.destroy();
        return { message: 'Usuário deletado com sucesso' };
    }
}
exports.UserRepository = UserRepository;
