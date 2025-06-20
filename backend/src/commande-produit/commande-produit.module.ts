import { Module } from '@nestjs/common';
import { CommandeProduitController } from './commande-produit.controller';
import { CommandeProduitService } from './commande-produit.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandeProduit } from './commande-produit.entity';

@Module({
  imports:[TypeOrmModule.forFeature([CommandeProduit])],
  controllers: [CommandeProduitController],
  providers: [CommandeProduitService],
  exports:[CommandeProduitService]
})
export class CommandeProduitModule {}
