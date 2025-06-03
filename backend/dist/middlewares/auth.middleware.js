"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }
        const [, token] = authHeader.split(' ');
        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || '');
        const user = await user_model_1.User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};
exports.authMiddleware = authMiddleware;
