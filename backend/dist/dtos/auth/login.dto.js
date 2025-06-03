"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = void 0;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
exports.loginSchema = {
    body: {
        type: 'object',
        required: ['email', 'password'],
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
                minLength: 6,
                maxLength: 100
            }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                token: { type: 'string' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        nome: { type: 'string' }
                    }
                }
            }
        },
        401: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                code: { type: 'string' }
            }
        }
    }
};
