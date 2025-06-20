import { Get, Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommandeProduit } from './commande-produit.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommandeProduitService {
        constructor(
    @InjectRepository(CommandeProduit)
    private commandeProduitRepository: Repository<CommandeProduit>,
  ) {}

    async findByCommandeId(commandeId: number): Promise<CommandeProduit[]> {
    return this.commandeProduitRepository.find({
      where: { commande_id: commandeId },
      relations: ['produit'], // si tu as une relation vers produit
    });
  }
}
