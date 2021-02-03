import { Test, TestingModule } from '@nestjs/testing';
import { ZoomController } from './zoom.controller';

describe('ZoomController', () => {
  let controller: ZoomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZoomController],
    }).compile();

    controller = module.get<ZoomController>(ZoomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
