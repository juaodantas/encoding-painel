"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = void 0;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
exports.updateUserSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' }
        }
    },
    body: {
        type: 'object',
        properties: {
            email: {
                type: 'string',
                format: 'email',
                pattern: emailRegex.source,
                minLength: 5,
                maxLength: 255
            },
            password: {
                type: 'string',
                pattern: passwordRegex.source,
                minLength: 6,
                maxLength: 100
            }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                nome: { type: 'string' }
            }
        },
        400: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                code: { type: 'string' }
            }
        },
        404: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                code: { type: 'string' }
            }
        }
    }
};
