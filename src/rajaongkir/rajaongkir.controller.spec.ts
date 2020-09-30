import { Test, TestingModule } from '@nestjs/testing';
import { RajaongkirController } from './rajaongkir.controller';

describe('RajaongkirController', () => {
  let controller: RajaongkirController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RajaongkirController],
    }).compile();

    controller = module.get<RajaongkirController>(RajaongkirController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
