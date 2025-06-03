import { VideoService } from '../video.service';
import { VideoRepository } from '../../repositories/video.repository';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { getIO } from '../../config/socket';
import { createKafkaProducer } from '../../plugins/kafkaProducer';

// Mock das dependências
jest.mock('../../repositories/video.repository');
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('uuid');
jest.mock('../../config/socket');
jest.mock('../../plugins/kafkaProducer');

describe('VideoService', () => {
  let videoService: VideoService;
  let mockFastify: any;
  let mockVideoRepository: jest.Mocked<VideoRepository>;

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
    mockVideoRepository = new VideoRepository() as jest.Mocked<VideoRepository>;
    (VideoRepository as jest.Mock).mockImplementation(() => mockVideoRepository);

    // Configura o mock do uuid
    (uuidv4 as jest.Mock).mockReturnValue('test-uuid');

    // Configura o mock do getSignedUrl
    (getSignedUrl as jest.Mock).mockResolvedValue('https://test-signed-url.com');

    // Configura o mock do getIO
    (getIO as jest.Mock).mockReturnValue({
      emit: jest.fn(),
    });

    // Configura o mock do createKafkaProducer
    (createKafkaProducer as jest.Mock).mockReturnValue({
      sendMessage: jest.fn(),
    });

    videoService = new VideoService(mockFastify);
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
      } as any);

      // Act
      const result = await videoService.generateUploadUrl(
        mockParams.fileName,
        mockParams.fileType,
        mockParams.userId
      );

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
      (getSignedUrl as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

      // Act & Assert
      await expect(
        videoService.generateUploadUrl(
          mockParams.fileName,
          mockParams.fileType,
          mockParams.userId
        )
      ).rejects.toThrow('Erro de autenticação com AWS S3');
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

      mockVideoRepository.findById.mockResolvedValue(mockVideo as any);
      mockVideoRepository.update.mockResolvedValue([1, [updatedMockVideo]] as any);

      // Act
      const result = await videoService.handleUploadComplete(
        mockParams.videoId,
        mockParams.etag
      );

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

      expect(mockVideoRepository.update).toHaveBeenCalledWith(
        mockParams.videoId,
        expect.objectContaining({
          status: 'uploaded',
          metadata: { etag: mockParams.etag }
        })
      );

      // Verifica se o evento foi emitido
      const mockIO = getIO();
      expect(mockIO.emit).toHaveBeenCalledWith('video:status-updated', {
        videoId: mockParams.videoId,
        status: 'uploaded',
        etag: mockParams.etag
      });

      // Verifica se a mensagem foi enviada para o Kafka
      const mockKafkaProducer = createKafkaProducer(mockFastify);
      expect(mockKafkaProducer.sendMessage).toHaveBeenCalledWith(
        'encoder-video',
        expect.objectContaining({
          videoId: mockParams.videoId,
          status: 'uploaded',
          etag: mockParams.etag
        })
      );
    });

    it('should throw error when video is not found', async () => {
      // Arrange
      mockVideoRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        videoService.handleUploadComplete(mockParams.videoId, mockParams.etag)
      ).rejects.toThrow('Vídeo não encontrado');
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

      mockVideoRepository.findById.mockResolvedValue(mockVideo as any);

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
      await expect(videoService.getVideoById(mockVideoId)).rejects.toThrow(
        'Vídeo não encontrado'
      );
    });
  });

  describe('updateVideoStatus', () => {
    const mockParams = {
      id: 'test-uuid',
      status: 'processing' as const,
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

      mockVideoRepository.update.mockResolvedValue([1, [mockVideo]] as any);

      // Act
      const result = await videoService.updateVideoStatus(
        mockParams.id,
        mockParams.status,
        mockParams.processedUrls
      );

      // Assert
      expect(result).toEqual(expect.objectContaining({
        id: mockParams.id,
        status: mockParams.status,
      }));
      expect(mockVideoRepository.update).toHaveBeenCalledWith(
        mockParams.id,
        expect.objectContaining({
          status: mockParams.status,
          processedUrl_720p: mockParams.processedUrls.url_720p,
          processedUrl_480p: mockParams.processedUrls.url_480p,
        })
      );
    });

    it('should throw error when update fails', async () => {
      // Arrange
      mockVideoRepository.update.mockResolvedValue([0, []] as any);

      // Act & Assert
      await expect(
        videoService.updateVideoStatus(mockParams.id, mockParams.status)
      ).rejects.toThrow('Falha ao atualizar status do vídeo');
    });
  });
}); 