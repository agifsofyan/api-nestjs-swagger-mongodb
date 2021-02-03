import { Test, TestingModule } from '@nestjs/testing';
import { ZoomService } from './zoom.service';

describe('ZoomService', () => {
  let service: ZoomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZoomService],
    }).compile();

    service = module.get<ZoomService>(ZoomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
