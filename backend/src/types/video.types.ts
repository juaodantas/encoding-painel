import { UserModel } from '../models/user.model';

export interface AuthRequest extends Request {
  user?: UserModel;
}

export interface GenerateUploadUrlBody {
  fileName: string;
  fileType: string;
  userId: string;
}

export interface GetVideoByIdParams {
  id: string;
}

export interface VideoResponse {
  id: string;
  fileName: string;
  fileType: string;
  userId: string;
  url?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
}

export interface VideoError {
  message: string;
  code: 'VIDEO_NOT_FOUND' | 'INVALID_DATA' | 'SERVER_ERROR' | 'UNAUTHORIZED';
} 