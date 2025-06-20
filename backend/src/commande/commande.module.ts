import { forwardRef, Module } from '@nestjs/common';
import { CommandeController } from './commande.controller';
import { CommandeService } from './commande.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commande } from './commande.entity';
import { CommandeProduit } from 'src/commande-produit/commande-produit.entity';
import { Produit } from 'src/produit/produit.entity';
import { Utilisateur } from 'src/Utilisateur/utilisateur.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports:[   forwardRef(() => NotificationsModule),TypeOrmModule.forFeature([Commande, CommandeProduit, Produit, Utilisateur])],
  controllers: [CommandeController],
  providers: [CommandeService]
})
export class CommandeModule {}
