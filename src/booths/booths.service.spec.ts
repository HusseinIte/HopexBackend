import { Test, TestingModule } from '@nestjs/testing';
import { BoothsService } from './booths.service';

describe('BoothsService', () => {
  let service: BoothsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoothsService],
    }).compile();

    service = module.get<BoothsService>(BoothsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
