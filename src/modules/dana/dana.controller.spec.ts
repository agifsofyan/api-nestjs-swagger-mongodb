import { Test, TestingModule } from '@nestjs/testing';
import { DanaController } from './dana.controller';

describe('DanaController', () => {
  let controller: DanaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DanaController],
    }).compile();

    controller = module.get<DanaController>(DanaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
