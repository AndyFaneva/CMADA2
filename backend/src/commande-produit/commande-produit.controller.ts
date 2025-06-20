import { Controller, Get, Param } from '@nestjs/common';
import { CommandeProduitService } from './commande-produit.service';

@Controller('commande/produit')
export class CommandeProduitController {
     constructor(private readonly commandeProduitService: CommandeProduitService) {}

  @Get(':id')
  async getProduitsByCommandeId(@Param('id') id: number) {
    return this.commandeProduitService.findByCommandeId(id);
  }
}
