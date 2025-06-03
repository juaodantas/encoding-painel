import { FastifyInstance } from 'fastify';
import { Producer } from 'kafkajs';

interface Message {
  [key: string]: any;
}

export class KafkaProducer {
  private producer: Producer;

  constructor(private readonly fastify: FastifyInstance) {
    this.producer = fastify.kafka.producer;
  }

  /**
   * Envia uma mensagem para um tópico Kafka
   * @param topic - Nome do tópico
   * @param message - Mensagem a ser enviada
   * @returns Promise<void>
   */
  public async sendMessage(topic: string, message: Message): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
      console.log(`Message sent to topic ${topic} successfully`);
    } catch (error) {
      console.error(`Error sending message to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Envia múltiplas mensagens para um tópico Kafka
   * @param topic - Nome do tópico
   * @param messages - Array de mensagens a serem enviadas
   * @returns Promise<void>
   */
  public async sendBatchMessages(topic: string, messages: Message[]): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: messages.map(message => ({
          value: JSON.stringify(message)
        })),
      });
      console.log(`Batch messages sent to topic ${topic} successfully`);
    } catch (error) {
      console.error(`Error sending batch messages to topic ${topic}:`, error);
      throw error;
    }
  }
}

// Factory function para criar uma instância do producer
export const createKafkaProducer = (fastify: FastifyInstance): KafkaProducer => {
  return new KafkaProducer(fastify);
};