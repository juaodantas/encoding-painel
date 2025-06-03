import { S3Client } from '@aws-sdk/client-s3';

const region = process.env.AWS_REGION || 'us-east-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
const bucket = process.env.S3_BUCKET || 'raw-videos-poc';

console.log('Configurando cliente S3:', {
  region,
  bucket,
  hasAccessKey: !!accessKeyId,
  hasSecretKey: !!secretAccessKey
});

if (!accessKeyId || !secretAccessKey) {
  console.warn('Credenciais AWS S3 não configuradas completamente');
}

export const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const S3_BUCKET = bucket; 