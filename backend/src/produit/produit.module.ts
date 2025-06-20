import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produit } from './produit.entity';
import { CategorieProduit } from 'src/categorie-produit/categorie-produit.entity';
import { CaracteristiqueProduit } from 'src/caracteristique-produit/caracteristique-produit.entity';
import { ProduitService } from './produit.service';
import { CategorieProduitService } from 'src/categorie-produit/categorie-produit.service';
import { CaracteristiqueProduitService } from 'src/caracteristique-produit/caracteristique-produit.service';
import { ProduitController } from './produit.controller';
import { CategorieProduitController } from 'src/categorie-produit/categorie-produit.controller';
import { CaracteristiqueProduitController } from 'src/caracteristique-produit/caracteristique-produit.controller';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Utilisateur } from 'src/Utilisateur/utilisateur.entity';

@Module({
  imports: [
    forwardRef(() => NotificationsModule),
    TypeOrmModule.forFeature([
      Produit,
      CategorieProduit,
      CaracteristiqueProduit,
      Utilisateur
    ]),
  ],
  controllers: [
    ProduitController,
    CategorieProduitController,
    CaracteristiqueProduitController,
  ],
  providers: [
    ProduitService,
    CategorieProduitService,
    CaracteristiqueProduitService,
  ],
  exports: [CategorieProduitService], // Exporté si utilisé ailleurs
})
export class ProduitModule {}