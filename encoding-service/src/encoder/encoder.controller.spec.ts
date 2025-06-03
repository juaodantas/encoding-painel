import { Test, TestingModule } from '@nestjs/testing';
import { EncoderController } from './encoder.controller';

describe('EncoderController', () => {
  let controller: EncoderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EncoderController],
    }).compile();

    controller = module.get<EncoderController>(EncoderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
