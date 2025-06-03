import { ClientKafka } from '@nestjs/microservices';
import { Inject, Injectable } from '@nestjs/common';
import { Admin, Kafka } from 'kafkajs';


@Injectable()
export class KafkaService {
  private kafka: Kafka;
  private admin: Admin;

  /**
   * Construtor para classe KafkaService
   * @param {ClientKafka} kafkaService injeção de dependencia para o client do kafka
   */
  public constructor(
    @Inject('KAFKA_SERVICE') private kafkaService: ClientKafka,
  ) {
    this.kafka = new Kafka({
      clientId: 'encoder-data-consumer',
      brokers: ['localhost:9092'],
    });

    this.admin = this.kafka.admin();
  }

  /**
   * Realiza a criação de tópicos no broker do kafka
   * @param {string[]} topics - Topicos kafkas para serem criados no Broker
   * @returns {Promise<void>} - Promise que é resolvida quando a operação é concluída.
   */
  public async createTopics(topics: string[]): Promise<void> {
    try {
      await this.admin.connect();
      const kafkaExistentTopics: string[] = await this.admin.listTopics();
      const topicToCreate: string[] = topics.filter((topic) => !kafkaExistentTopics.includes(topic));
      
      if (topicToCreate.length > 0) {
        await this.admin.createTopics({
          topics: topicToCreate.map((topic) => ({
            topic,
            numPartitions: 1,
            replicationFactor: 1,
            configEntries: [
              {
                name: 'retention.ms',
                value: (24 * 60 * 60 * 1000).toString(), 
              },
            ],
          })),
        });
        console.log({ message: 'Tópicos Kafka Criados: ', topicToCreate });
      } else {
        console.log('Os Tópicos Kafka já existem !!');
      }
    } catch (error) {
      console.error('Erro ao criar tópicos:', error);
      throw error;
    } finally {
      await this.admin.disconnect();
    }
  }

  /**
   * Método para verificar a conexão com o Kafka
   * @returns {Promise<void>} - Promise que é resolvida quando a operação é concluída
   */
  public async checkConnection(): Promise<void> {
    try {
      await this.admin.connect();
      console.log('Conexão com Kafka estabelecida com sucesso');
    } catch (error) {
      console.error('Erro ao conectar com Kafka:', error);
      throw error;
    } finally {
      await this.admin.disconnect();
    }
  }

  /* eslint-enable */

  /**
   * Método para enviar informações IoT via Kafka para o topico kafka
   * @param {IotData} message - dado formatado para envio
   * @returns {Promise<void>} - Promise que é resolvida quando a operação é concluída.
   */
  private sendToKafkaTopic(message: {}): void {
    try {
      const messageStringfy: string = JSON.stringify(message);
      this.kafkaService.emit('', messageStringfy);
    } catch (error) {
      throw new Error(`Erro ao enviar mensagem para o Kafka:' ${error}`);
    }
  }
}
