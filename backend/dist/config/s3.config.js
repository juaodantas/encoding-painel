"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3_BUCKET = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
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
exports.s3Client = new client_s3_1.S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});
exports.S3_BUCKET = bucket;
