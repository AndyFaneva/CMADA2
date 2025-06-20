import { Module } from '@nestjs/common';
import { CaracteristiqueProduitController } from './caracteristique-produit.controller';
import { CaracteristiqueProduitService } from './caracteristique-produit.service';
import { UtilisateurModule } from 'src/Utilisateur/utilisateur.module';
import { ProduitModule } from 'src/produit/produit.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UtilisateurModule, ProduitModule, AuthModule],
  controllers: [CaracteristiqueProduitController],
  providers: [CaracteristiqueProduitService],
})
export class ShoppingCartModule {}
