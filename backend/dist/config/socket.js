"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const video_service_1 = require("../services/video.service");
let io;
let videoService;
const initializeSocket = (server, fastify) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        },
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
        allowEIO3: true
    });
    // Inicializa o VideoService com a instância do Fastify
    videoService = new video_service_1.VideoService(fastify);
    io.on('connection', (socket) => {
        console.log('Cliente conectado:', socket.id);
        socket.on('video:upload-complete', async (data) => {
            try {
                console.log('Recebendo evento de upload completo:', data);
                await videoService.handleUploadComplete(data.videoId, data.etag);
            }
            catch (error) {
                console.error('Erro ao processar upload completo:', error);
                socket.emit('video:upload-error', {
                    videoId: data.videoId,
                    error: error instanceof Error ? error.message : 'Erro desconhecido'
                });
            }
        });
        socket.on('disconnect', () => {
            console.log('Cliente desconectado:', socket.id);
        });
    });
    return io;
};
exports.initializeSocket = initializeSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO não foi inicializado');
    }
    return io;
};
exports.getIO = getIO;
