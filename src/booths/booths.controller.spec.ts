import { Test, TestingModule } from '@nestjs/testing';
import { BoothsController } from './booths.controller';

describe('BoothsController', () => {
  let controller: BoothsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoothsController],
    }).compile();

    controller = module.get<BoothsController>(BoothsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
