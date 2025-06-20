import { Test, TestingModule } from '@nestjs/testing';
import { CommandeProduitService } from './commande-produit.service';

describe('CommandeProduitService', () => {
  let service: CommandeProduitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommandeProduitService],
    }).compile();

    service = module.get<CommandeProduitService>(CommandeProduitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
