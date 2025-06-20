import { Test, TestingModule } from '@nestjs/testing';
import { CommandeProduitController } from './commande-produit.controller';

describe('CommandeProduitController', () => {
  let controller: CommandeProduitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommandeProduitController],
    }).compile();

    controller = module.get<CommandeProduitController>(CommandeProduitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
