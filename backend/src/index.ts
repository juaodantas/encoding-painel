import { config } from 'dotenv';
import { fastify } from 'fastify';
import { sequelize } from './config/database';
import { setupSwagger } from './config/swagger';
import { initializeSocket } from './config/socket';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import kafkaPlugin from './config/kafka';

// Load environment variables
config();

const PORT = parseInt(process.env.PORT || '3001', 10);

// Create Fastify instance
const app = fastify({
  logger: true
});

async function startServer() {
  try {
    // Inicializa a conexão com o banco de dados
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Register plugins
    await app.register(cors, {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    });

    await app.register(jwt, {
      secret: process.env.JWT_SECRET || 'your-secret-key'
    });

    // Register Kafka plugin
    await app.register(kafkaPlugin);
    console.log('Kafka plugin registered successfully');

    // Register routes
    await app.register(import('./routes/auth.routes'));
    await app.register(import('./routes/video.routes'));
    await app.register(import('./routes/user.routes'));


    // Setup Swagger
    setupSwagger(app);

    // Inicializa o Socket.IO usando o servidor HTTP do Fastify
    const io = initializeSocket(app.server, app);
    console.log('Socket.IO has been initialized successfully.');

    // Inicia o servidor HTTP com Fastify
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();