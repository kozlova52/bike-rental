import { Test, TestingModule } from '@nestjs/testing';
import { RentalPointsService } from './rental-points.service';

describe('RentalPointsService', () => {
  let service: RentalPointsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RentalPointsService],
    }).compile();

    service = module.get<RentalPointsService>(RentalPointsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
