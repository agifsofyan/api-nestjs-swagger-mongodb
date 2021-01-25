import { Test, TestingModule } from '@nestjs/testing';
import { DanaService } from './dana.service';

describe('DanaService', () => {
  let service: DanaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DanaService],
    }).compile();

    service = module.get<DanaService>(DanaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
