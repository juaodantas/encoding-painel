"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUploadUrlSchema = void 0;
exports.generateUploadUrlSchema = {
    body: {
        type: 'object',
        required: ['fileName', 'fileType', 'userId'],
        properties: {
            fileName: {
                type: 'string',
                minLength: 1,
                maxLength: 255
            },
            fileType: {
                type: 'string',
                minLength: 1,
                maxLength: 50
            },
            userId: {
                type: 'string',
                format: 'uuid'
            }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                videoId: { type: 'string' },
                fileName: { type: 'string' },
                uploadUrl: { type: 'string' },
                key: { type: 'string' }
            }
        },
        400: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                code: { type: 'string' }
            }
        },
        401: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                code: { type: 'string' }
            }
        },
        500: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                code: { type: 'string' }
            }
        }
    }
};
