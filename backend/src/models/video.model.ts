import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';

export interface VideoAttributes {
  id: string;
  titulo: string;
  descricao: string;
  status: 'pending' | 'uploaded' | 'processing' | 'done' | 'error';
  originalUrl: string;
  processedUrl_720p?: string;
  processedUrl_480p?: string;
  dataUpload?: Date;
  usuarioCriadorId: string;
  metadata?: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
}

export interface VideoCreationAttributes extends Optional<VideoAttributes, 'id' | 'processedUrl_720p' | 'processedUrl_480p' | 'dataUpload' | 'metadata' | 'created_at' | 'updated_at'> {}

export class VideoModel extends Model<VideoAttributes, VideoCreationAttributes> implements VideoAttributes {
  public id!: string;
  public titulo!: string;
  public descricao!: string;
  public status!: 'pending' | 'uploaded' | 'processing' | 'done' | 'error';
  public originalUrl!: string;
  public processedUrl_720p?: string;
  public processedUrl_480p?: string;
  public dataUpload?: Date;
  public usuarioCriadorId!: string;
  public metadata?: Record<string, any>;
  public created_at!: Date;
  public updated_at!: Date;
}

export const Video = sequelize.define<VideoModel>('Video', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'uploaded', 'processing', 'done', 'error'),
    allowNull: false,
    defaultValue: 'pending'
  },
  originalUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  processedUrl_720p: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  processedUrl_480p: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dataUpload: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  usuarioCriadorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'videos',
  timestamps: true,
  underscored: true,
});

// Relacionamento com User
Video.belongsTo(User, { foreignKey: 'usuarioCriadorId', as: 'criador' });
User.hasMany(Video, { foreignKey: 'usuarioCriadorId', as: 'videos' }); 