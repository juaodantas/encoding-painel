"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const video_service_1 = require("../video.service");
const video_repository_1 = require("../../repositories/video.repository");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const socket_1 = require("../../config/socket");
const kafkaProducer_1 = require("../../plugins/kafkaProducer");
// Mock das dependências
jest.mock('../../repositories/video.repository');
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('uuid');
jest.mock('../../config/socket');
jest.mock('../../plugins/kafkaProducer');
describe('VideoService', () => {
    let videoService;
    let mockFastify;
    let mockVideoRepository;
    beforeEach(() => {
        // Limpa todos os mocks antes de cada teste
        jest.clearAllMocks();
        // Configura o mock do Fastify
        mockFastify = {
            log: {
                info: jest.fn(),
                error: jest.fn(),
            },
        };
        // Configura o mock do VideoRepository
        mockVideoRepository = new video_repository_1.VideoRepository();
        video_repository_1.VideoRepository.mockImplementation(() => mockVideoRepository);
        // Configura o mock do uuid
        uuid_1.v4.mockReturnValue('test-uuid');
        // Configura o mock do getSignedUrl
        s3_request_presigner_1.getSignedUrl.mockResolvedValue('https://test-signed-url.com');
        // Configura o mock do getIO
        socket_1.getIO.mockReturnValue({
            emit: jest.fn(),
        });
        // Configura o mock do createKafkaProducer
        kafkaProducer_1.createKafkaProducer.mockReturnValue({
            sendMessage: jest.fn(),
        });
        videoService = new video_service_1.VideoService(mockFastify);
    });
    describe('generateUploadUrl', () => {
        const mockParams = {
            fileName: 'test-video.mp4',
            fileType: 'video/mp4',
            userId: 'user-123',
        };
        it('should generate upload URL successfully', async () => {
            // Arrange
            mockVideoRepository.create.mockResolvedValue({
                id: 'test-uuid',
                titulo: mockParams.fileName,
                status: 'pending',
            });
            // Act
            const result = await videoService.generateUploadUrl(mockParams.fileName, mockParams.fileType, mockParams.userId);
            // Assert
            expect(result).toEqual({
                uploadUrl: 'https://test-signed-url.com',
                key: 'test-uuid',
            });
            expect(mockVideoRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                id: 'test-uuid',
                titulo: mockParams.fileName,
                status: 'pending',
            }));
        });
        it('should throw error when S3 credentials are invalid', async () => {
            // Arrange
            s3_request_presigner_1.getSignedUrl.mockRejectedValue(new Error('Invalid credentials'));
            // Act & Assert
            await expect(videoService.generateUploadUrl(mockParams.fileName, mockParams.fileType, mockParams.userId)).rejects.toThrow('Erro de autenticação com AWS S3');
        });
    });
    describe('handleUploadComplete', () => {
        const mockParams = {
            videoId: 'test-uuid',
            etag: 'test-etag',
        };
        it('should handle upload completion successfully', async () => {
            // Arrange
            const mockVideo = {
                id: mockParams.videoId,
                titulo: 'test-video.mp4',
                status: 'pending',
                originalUrl: 'test-url',
                usuarioCriadorId: 'user-123',
                metadata: { fileType: 'video/mp4' },
                created_at: new Date(),
                updated_at: new Date(),
            };
            const updatedMockVideo = {
                ...mockVideo,
                status: 'uploaded',
                metadata: { ...mockVideo.metadata, etag: mockParams.etag }
            };
            mockVideoRepository.findById.mockResolvedValue(mockVideo);
            mockVideoRepository.update.mockResolvedValue([1, [updatedMockVideo]]);
            // Act
            const result = await videoService.handleUploadComplete(mockParams.videoId, mockParams.etag);
            // Assert
            expect(result).toEqual({
                id: mockParams.videoId,
                fileName: updatedMockVideo.titulo,
                fileType: updatedMockVideo.metadata.fileType,
                userId: updatedMockVideo.usuarioCriadorId,
                url: updatedMockVideo.originalUrl,
                status: 'uploaded',
                createdAt: updatedMockVideo.created_at,
                updatedAt: updatedMockVideo.updated_at
            });
            expect(mockVideoRepository.update).toHaveBeenCalledWith(mockParams.videoId, expect.objectContaining({
                status: 'uploaded',
                metadata: { etag: mockParams.etag }
            }));
            // Verifica se o evento foi emitido
            const mockIO = (0, socket_1.getIO)();
            expect(mockIO.emit).toHaveBeenCalledWith('video:status-updated', {
                videoId: mockParams.videoId,
                status: 'uploaded',
                etag: mockParams.etag
            });
            // Verifica se a mensagem foi enviada para o Kafka
            const mockKafkaProducer = (0, kafkaProducer_1.createKafkaProducer)(mockFastify);
            expect(mockKafkaProducer.sendMessage).toHaveBeenCalledWith('encoder-video', expect.objectContaining({
                videoId: mockParams.videoId,
                status: 'uploaded',
                etag: mockParams.etag
            }));
        });
        it('should throw error when video is not found', async () => {
            // Arrange
            mockVideoRepository.findById.mockResolvedValue(null);
            // Act & Assert
            await expect(videoService.handleUploadComplete(mockParams.videoId, mockParams.etag)).rejects.toThrow('Vídeo não encontrado');
        });
    });
    describe('getVideoById', () => {
        const mockVideoId = 'test-uuid';
        it('should return video when found', async () => {
            // Arrange
            const mockVideo = {
                id: mockVideoId,
                titulo: 'test-video.mp4',
                status: 'done',
                originalUrl: 'test-url',
                usuarioCriadorId: 'user-123',
                metadata: { fileType: 'video/mp4' },
                created_at: new Date(),
                updated_at: new Date(),
            };
            mockVideoRepository.findById.mockResolvedValue(mockVideo);
            // Act
            const result = await videoService.getVideoById(mockVideoId);
            // Assert
            expect(result).toEqual({
                id: mockVideoId,
                fileName: mockVideo.titulo,
                fileType: mockVideo.metadata.fileType,
                userId: mockVideo.usuarioCriadorId,
                url: mockVideo.originalUrl,
                status: mockVideo.status,
                createdAt: mockVideo.created_at,
                updatedAt: mockVideo.updated_at,
            });
        });
        it('should throw error when video is not found', async () => {
            // Arrange
            mockVideoRepository.findById.mockResolvedValue(null);
            // Act & Assert
            await expect(videoService.getVideoById(mockVideoId)).rejects.toThrow('Vídeo não encontrado');
        });
    });
    describe('updateVideoStatus', () => {
        const mockParams = {
            id: 'test-uuid',
            status: 'processing',
            processedUrls: {
                url_720p: 'https://test-720p.mp4',
                url_480p: 'https://test-480p.mp4',
            },
        };
        it('should update video status successfully', async () => {
            // Arrange
            const mockVideo = {
                id: mockParams.id,
                titulo: 'test-video.mp4',
                status: mockParams.status,
                originalUrl: 'test-url',
                usuarioCriadorId: 'user-123',
                metadata: { fileType: 'video/mp4' },
                created_at: new Date(),
                updated_at: new Date(),
            };
            mockVideoRepository.update.mockResolvedValue([1, [mockVideo]]);
            // Act
            const result = await videoService.updateVideoStatus(mockParams.id, mockParams.status, mockParams.processedUrls);
            // Assert
            expect(result).toEqual(expect.objectContaining({
                id: mockParams.id,
                status: mockParams.status,
            }));
            expect(mockVideoRepository.update).toHaveBeenCalledWith(mockParams.id, expect.objectContaining({
                status: mockParams.status,
                processedUrl_720p: mockParams.processedUrls.url_720p,
                processedUrl_480p: mockParams.processedUrls.url_480p,
            }));
        });
        it('should throw error when update fails', async () => {
            // Arrange
            mockVideoRepository.update.mockResolvedValue([0, []]);
            // Act & Assert
            await expect(videoService.updateVideoStatus(mockParams.id, mockParams.status)).rejects.toThrow('Falha ao atualizar status do vídeo');
        });
    });
});
