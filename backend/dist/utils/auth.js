"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = exports.comparePassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const comparePassword = async (plainPassword, hashedPassword) => {
    return bcrypt_1.default.compare(plainPassword, hashedPassword);
};
exports.comparePassword = comparePassword;
const hashPassword = async (password) => {
    const saltRounds = 10;
    return bcrypt_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
