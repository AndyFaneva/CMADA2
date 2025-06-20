import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CommandeService } from './commande.service';
import { Commande } from './commande.entity';

@Controller('commande')
export class CommandeController {
     constructor(private readonly commandeService: CommandeService) {}

  @Post()
  async createCommande(@Body() data: any): Promise<Commande[]> {
    return this.commandeService.create(data);
  }

  @Get()
  async getAll(): Promise<Commande[]> {
    return this.commandeService.findAll();
  }

@Delete('annuler/:id')
async annuler(@Param('id') id: number) {
  return this.commandeService.annulerCommande(id);
}

@Patch(':id/valider')
async valider(@Param('id') id: number) {
  return this.commandeService.validerCommande(Number(id));
}

@Patch(':id/enPreparation')
async enPreparation(@Param('id') id: number) {
  return this.commandeService.commandeEnPreparation(Number(id));
}

@Patch(':id/expedier')
async expedier(@Param('id') id: number) {
  return this.commandeService.commandeExpedier(Number(id));
}

@Patch(':id/livrer')
async livrer(@Param('id') id: number) {
  return this.commandeService.commandeLivrer(Number(id));
}


  @Get(':id')
async getCommandeById(@Param('id') id: string) {
  return this.commandeService.findById(+id);
}
}
