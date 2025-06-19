import { emitVideoStatusUpdate } from '../config/socket';
import { Video, VideoCreationAttributes, VideoModel } from '../models/video.model';

export class VideoRepository {
  async create(videoData: VideoCreationAttributes): Promise<VideoModel> {
    emitVideoStatusUpdate({
      videoId: videoData.id ?? '',
      status: 'pending',
    });
    
    return await Video.create(videoData);
  }

  async findById(id: string): Promise<VideoModel | null> {
    return await Video.findByPk(id);
  }
  
  async findAll(): Promise<VideoModel[]> {
    return await Video.findAll();
  }

  async update(id: string, videoData: Partial<VideoCreationAttributes>): Promise<[number, VideoModel[]]> {
    return await Video.update(videoData, {
      where: { id },
      returning: true,
    });
  }
} 