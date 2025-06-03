import { Module } from '@nestjs/common';
import { KafkaModule } from './kafka/kafka.module';
import { EncoderModule } from './encoder/encoder.module';

@Module({
  imports: [KafkaModule, EncoderModule],
})
export class AppModule {}
