import { Module } from '@nestjs/common';
import { CategorieProduitService } from './categorie-produit.service';
import { CategorieProduitController } from './categorie-produit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategorieProduit } from './categorie-produit.entity';

@Module({
  imports:[TypeOrmModule.forFeature([CategorieProduit])],
  providers: [CategorieProduitService],
  controllers: [CategorieProduitController]
})
export class CategorieProduitModule {}
