globalThis.crypto = require('crypto');
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilisateurModule } from './Utilisateur/utilisateur.module';
import { CategorieProduitModule } from './categorie-produit/categorie-produit.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { ProduitModule } from './produit/produit.module';
import { Produit } from './produit/produit.entity';
import { CaracteristiqueProduit } from './caracteristique-produit/caracteristique-produit.entity';
import { MulterModule } from '@nestjs/platform-express';
import { CommandeModule } from './commande/commande.module';
import { CommandeProduitModule } from './commande-produit/commande-produit.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
     MulterModule.register({
      dest: './uploads',
    }),
    JwtModule.register({
      secret: 'zD87s9fhsd8fyshdfsdyf@#jksdf908sdjfhsdjf',
      signOptions: { expiresIn: '1h' },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
        type:'mysql',
        host:'127.0.0.1',
        port:3306,
        username:'root',
        password:'faneva130904',
        database:'bddcmada1_0',
        entities:[__dirname + '/**/*.entity{.ts,.js}',Produit, CaracteristiqueProduit,],
         synchronize:false,
         // dropSchema:true,
        // logging: true
    }),
    UtilisateurModule,
    CategorieProduitModule,
    MailModule,
    AuthModule,
    ProduitModule,
    CommandeModule,
    CommandeProduitModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
