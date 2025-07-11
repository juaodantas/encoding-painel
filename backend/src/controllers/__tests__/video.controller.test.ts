import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { VideoController } from '../video.controller';
import { VideoService } from '../../services/video.service';
import { GenerateUploadUrlBody, GetVideoByIdParams, VideoResponse, UploadUrlResponse } from '../../types/video.types';

// Mock do VideoService
jest.mock('../../services/video.service');

describe('VideoController', () => {
  let videoController: VideoController;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockFastify: Partial<FastifyInstance>;
  let mockVideoService: jest.Mocked<VideoService>;

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();

    // Configura o mock do Fastify
    mockFastify = {
      log: {
        info: jest.fn(),
        error: jest.fn(),
        child: jest.fn(),
        level: 'info',
        fatal: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        trace: jest.fn(),
        silent: jest.fn()
      } as any
    };

    mockRequest = {
      body: {},
      params: {},
    };

    mockReply = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    // Configura o mock do VideoService
    mockVideoService = new VideoService(mockFastify as FastifyInstance) as jest.Mocked<VideoService>;
    (VideoService as jest.Mock).mockImplementation(() => mockVideoService);

    videoController = new VideoController(mockFastify as FastifyInstance);
  });

  describe('generateUploadUrl', () => {
    const mockUploadData: GenerateUploadUrlBody = {
      fileName: 'test-video.mp4',
      fileType: 'video/mp4',
      userId: '123'
    };

    it('should generate upload URL successfully', async () => {
      // Arrange
      mockRequest.body = mockUploadData;
      const mockResponse: UploadUrlResponse = {
        videoId: '123',
        fileName: 'test-video.mp4',
        uploadUrl: 'https://example.com/upload',
        key: 'test-video.mp4'
      };
      mockVideoService.generateUploadUrl.mockResolvedValue(mockResponse);

      // Act
      const result = await videoController.generateUploadUrl(
        mockRequest as FastifyRequest<{ Body: GenerateUploadUrlBody }>,
        mockReply as FastifyReply
      );

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockVideoService.generateUploadUrl).toHaveBeenCalledWith(
        mockUploadData.fileName,
        mockUploadData.fileType,
        mockUploadData.userId
      );
      expect(mockReply.send).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle missing userId', async () => {
      // Arrange
      mockRequest.body = { ...mockUploadData, userId: undefined };

      // Act & Assert
      await expect(
        videoController.generateUploadUrl(
          mockRequest as FastifyRequest<{ Body: GenerateUploadUrlBody }>,
          mockReply as FastifyReply
        )
      ).rejects.toMatchObject({
        message: 'Usuário não autenticado',
        code: 'INVALID_DATA'
      });
      expect(mockReply.status).toHaveBeenCalledWith(401);
    });

    it('should handle missing fileName or fileType', async () => {
      // Arrange
      mockRequest.body = { userId: '123' }; // Missing fileName and fileType

      // Act & Assert
      await expect(
        videoController.generateUploadUrl(
          mockRequest as FastifyRequest<{ Body: GenerateUploadUrlBody }>,
          mockReply as FastifyReply
        )
      ).rejects.toMatchObject({
        message: 'Nome do arquivo e tipo são obrigatórios',
        code: 'INVALID_DATA'
      });
      expect(mockReply.status).toHaveBeenCalledWith(400);
    });

    it('should handle service error', async () => {
      // Arrange
      mockRequest.body = mockUploadData;
      const mockError = {
        message: 'Erro ao gerar URL de upload',
        code: 'INVALID_DATA'
      };
      mockVideoService.generateUploadUrl.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        videoController.generateUploadUrl(
          mockRequest as FastifyRequest<{ Body: GenerateUploadUrlBody }>,
          mockReply as FastifyReply
        )
      ).rejects.toEqual(mockError);
      expect(mockReply.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getVideoById', () => {
    it('should get video successfully', async () => {
      // Arrange
      mockRequest.params = { id: '123' };
      const mockResponse: VideoResponse = {
        id: '123',
        fileName: 'test-video.mp4',
        fileType: 'video/mp4',
        userId: 'user123',
        url: 'https://example.com/video.mp4',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockVideoService.getVideoById.mockResolvedValue(mockResponse);

      // Act
      const result = await videoController.getVideoById(
        mockRequest as FastifyRequest<{ Params: GetVideoByIdParams }>,
        mockReply as FastifyReply
      );

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockVideoService.getVideoById).toHaveBeenCalledWith('123');
      expect(mockReply.send).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle video not found', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      const mockError = {
        message: 'Vídeo não encontrado',
        code: 'SERVER_ERROR'
      };
      mockVideoService.getVideoById.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        videoController.getVideoById(
          mockRequest as FastifyRequest<{ Params: GetVideoByIdParams }>,
          mockReply as FastifyReply
        )
      ).rejects.toMatchObject({
        message: 'Vídeo não encontrado',
        code: 'SERVER_ERROR'
      });
      expect(mockReply.status).toHaveBeenCalledWith(500);
    });

    it('should handle service error', async () => {
      // Arrange
      mockRequest.params = { id: '123' };
      const mockError = {
        message: 'Erro ao buscar vídeo',
        code: 'SERVER_ERROR'
      };
      mockVideoService.getVideoById.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        videoController.getVideoById(
          mockRequest as FastifyRequest<{ Params: GetVideoByIdParams }>,
          mockReply as FastifyReply
        )
      ).rejects.toEqual(mockError);
      expect(mockReply.status).toHaveBeenCalledWith(500);
    });
  });
}); 