import { FastifyPluginAsync } from 'fastify';
import { Kafka, Producer } from 'kafkajs';

declare module 'fastify' {
  interface FastifyInstance {
    kafka: {
      producer: Producer;
    };
  }
}

const kafkaPlugin: FastifyPluginAsync = async (fastify) => {
  console.log('Initializing Kafka plugin...');
  
  try {
    const kafka = new Kafka({
      clientId: process.env.KAFKA_GROUPID || 'video-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
    });

    console.log('Kafka instance created with config:', {
      clientId: process.env.KAFKA_GROUPID || 'video-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
    });

    const producer = kafka.producer();

    await producer.connect();
    console.log('Kafka producer connected successfully');

    fastify.decorate('kafka', {
      producer
    });
    console.log('Kafka producer decorated to fastify instance');

    fastify.addHook('onClose', async () => {
      await producer.disconnect();
      console.log('Kafka producer disconnected');
    });

    // Removido o onRequest (causa o erro)
    // fastify.addHook('onRequest', ...) ❌

    console.log('Kafka plugin initialization completed');
  } catch (error) {
    console.error('Error initializing Kafka plugin:', error);
    throw error;
  }
};
export default kafkaPlugin;