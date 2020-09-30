import { Test, TestingModule } from '@nestjs/testing';
import { RajaongkirService } from './rajaongkir.service';

describe('RajaongkirService', () => {
  let service: RajaongkirService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RajaongkirService],
    }).compile();

    service = module.get<RajaongkirService>(RajaongkirService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
