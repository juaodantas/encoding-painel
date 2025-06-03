import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as ffmpeg from 'fluent-ffmpeg';

@Injectable()
export class EncoderService {
  private readonly s3Client: AWS.S3;

  public constructor() {
    this.s3Client = new AWS.S3({
      region: process.env.AWS_REGION ?? 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
      },
    });
  }

  /**
   * Processa o vídeo: baixa do S3, codifica com FFmpeg e faz upload para outro bucket.
   * @param s3Url URL do vídeo no S3 (ex: s3://bucket/key/file.mp4)
   */
  public async encoder(s3Url: string): Promise<string> {
    // 1. Extrai o bucket e a chave do vídeo
    const { bucket, key } = this.parseS3Url(s3Url);

    // 2. Baixa o vídeo do S3
    const tempInputPath = `/tmp/${key}`;
    const tempOutputPath = `/tmp/encoded_${key}`;

    await this.downloadFromS3(bucket, key, tempInputPath);

    // 3. Codifica o vídeo com FFmpeg
    await this.encodeWithFFmpeg(tempInputPath, tempOutputPath);

    // 4. Faz upload do vídeo codificado para outro bucket
    const outputBucket = 'encoded-videos-poc';
    const outputKey = `encoded/${key}`;
    await this.uploadToS3(outputBucket, outputKey, tempOutputPath);

    // 5. Retorna a URL do vídeo processado
    return `https://${outputBucket}.s3.amazonaws.com/${outputKey}`; 
  }

  /**
   * Baixa um arquivo do S3 para o disco local.
   */
  private async downloadFromS3(bucket: string, key: string, localPath: string): Promise<void> {
    const params = { Bucket: bucket, Key: key };
    const data = await this.s3Client.getObject(params).promise();
    require('fs').writeFileSync(localPath, data.Body);
  }

  /**
   * Codifica o vídeo usando FFmpeg.
   */
  private async encodeWithFFmpeg(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v h264', // Codec H.264
          '-preset fast', // Velocidade de codificação
          '-crf 23', // Qualidade (mais baixo = melhor qualidade)
          '-c:a aac', // Codec de áudio
        ])
        .save(outputPath)
        .on('end', resolve)
        .on('error', reject);
    });
  }

  /**
   * Faz upload de um arquivo para o S3.
   */
  private async uploadToS3(bucket: string, key: string, localPath: string): Promise<void> {
    const fileContent = require('fs').readFileSync(localPath);
    const params = {
      Bucket: bucket,
      Key: key,
      Body: fileContent,
      ContentType: 'video/mp4',
    };
    await this.s3Client.putObject(params).promise();
  }

  /**
   * Extrai o bucket e a chave de uma URL S3.
   */
  private parseS3Url(s3Url: string): { bucket: string; key: string } {
    const match = s3Url.match(/^s3:\/\/([^/]+)\/(.+)$/);
    if (!match) {
      throw new Error('URL S3 inválida');
    }
    return {
      bucket: match[1],
      key: match[2],
    };
  }
}