import { Test, TestingModule } from '@nestjs/testing';
import { XenditService } from './xendit.service';

describe('XenditService', () => {
  let service: XenditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [XenditService],
    }).compile();

    service = module.get<XenditService>(XenditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
