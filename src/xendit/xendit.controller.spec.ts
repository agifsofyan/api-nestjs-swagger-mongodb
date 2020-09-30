import { Test, TestingModule } from '@nestjs/testing';
import { XenditController } from './xendit.controller';

describe('XenditController', () => {
  let controller: XenditController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [XenditController],
    }).compile();

    controller = module.get<XenditController>(XenditController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
