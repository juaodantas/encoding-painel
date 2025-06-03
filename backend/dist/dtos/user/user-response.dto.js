"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserResponseSchema = exports.errorResponseSchema = exports.userResponseSchema = exports.userListResponseSchema = void 0;
exports.userListResponseSchema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            nome: { type: 'string' }
        }
    }
};
exports.userResponseSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        nome: { type: 'string' }
    }
};
exports.errorResponseSchema = {
    type: 'object',
    properties: {
        message: { type: 'string' },
        code: { type: 'string' }
    }
};
exports.deleteUserResponseSchema = {
    type: 'object',
    properties: {
        message: { type: 'string' },
        id: { type: 'string' }
    }
};
