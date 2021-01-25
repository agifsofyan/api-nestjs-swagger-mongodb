import { Test, TestingModule } from '@nestjs/testing';
import { BanktransferController } from './banktransfer.controller';

describe('BanktransferController', () => {
  let controller: BanktransferController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BanktransferController],
    }).compile();

    controller = module.get<BanktransferController>(BanktransferController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
