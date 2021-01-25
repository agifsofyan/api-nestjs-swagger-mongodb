import { Test, TestingModule } from '@nestjs/testing';
import { BanktransferService } from './banktransfer.service';

describe('BanktransferService', () => {
  let service: BanktransferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BanktransferService],
    }).compile();

    service = module.get<BanktransferService>(BanktransferService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
