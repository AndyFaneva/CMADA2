// src/commande/commande.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Commande } from './commande.entity';
import { CommandeProduit } from 'src/commande-produit/commande-produit.entity';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { Produit } from 'src/produit/produit.entity'; // Ajouté pour charger les produits
import * as crypto from 'crypto';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import {Cron} from '@nestjs/schedule';
import { Utilisateur } from 'src/Utilisateur/utilisateur.entity';

@Injectable()
export class CommandeService {
  constructor(
    @InjectRepository(Commande)
    private commandeRepository: Repository<Commande>,

    @InjectRepository(CommandeProduit)
    private commandeProduitRepository: Repository<CommandeProduit>,

    @InjectRepository(Produit)
    private produitRepository: Repository<Produit>,

      private readonly notificationsGateway: NotificationsGateway,

      @InjectRepository(Utilisateur)
            private readonly repo: Repository<Utilisateur>,
  ) {}

async create(createCommandeDto: CreateCommandeDto): Promise<Commande[]> {
  const { items, ...commandeData } = createCommandeDto;

  const itemsParFournisseur = new Map<number, typeof items[0][]>();

  console.log('➡️ Données de la commande reçue :', createCommandeDto);

  // Étape 1 : Charger les fournisseurs depuis les produits
  for (const item of items) {
    const produit = await this.produitRepository.findOne({
      where: { id: item.produit_id },
      relations: ['fournisseur'],
    });

    if (!produit) {
      console.error(`❌ Produit avec l'id ${item.produit_id} non trouvé`);
      throw new NotFoundException(`Produit avec l'id ${item.produit_id} non trouvé`);
    }

    const fournisseurId = produit.fournisseur?.id;
    if (!fournisseurId) {
      console.error(`❌ Fournisseur non trouvé pour le produit ${item.produit_id}`);
      throw new NotFoundException(`Fournisseur non trouvé pour le produit ${item.produit_id}`);
    }

    // Injecter l'id du fournisseur dans l'item
    item.fournisseur_id = fournisseurId;

    if (!itemsParFournisseur.has(fournisseurId)) {
      itemsParFournisseur.set(fournisseurId, []);
    }

    itemsParFournisseur.get(fournisseurId)!.push(item);
  }

  console.log('✅ Items regroupés par fournisseur :', Object.fromEntries(itemsParFournisseur));

  const commandesCreees: Commande[] = [];

  // Étape 2 : Créer une commande par fournisseur
// Étape 2 : Créer une commande par fournisseur
for (const [fournisseurId, itemsFournisseur] of itemsParFournisseur.entries()) {
  console.log(`📦 Création de commande pour le fournisseur ID: ${fournisseurId}`);

  // 1️⃣ Calculer les totaux spécifiques à ce fournisseur
let sousTotalFournisseur = 0;

for (const item of itemsFournisseur) {
  const produit = await this.produitRepository.findOne({
    where: { id: item.produit_id },
  });

  if (!produit) {
    throw new NotFoundException(`Produit avec l'id ${item.produit_id} non trouvé`);
  }

  sousTotalFournisseur += Number(produit.prix) * item.quantite;
}


  const remiseFournisseur = 0; // ou une logique personnalisée
  const livraisonFournisseur = 0;
  const tvaFournisseur = sousTotalFournisseur * 0.2;
  const totalFournisseur = sousTotalFournisseur - remiseFournisseur + livraisonFournisseur + tvaFournisseur;

  // 2️⃣ Créer la commande avec les totaux spécifiques
  const commande = this.commandeRepository.create({
    ...commandeData,
    fournisseur_id: fournisseurId,
    sousTotal: sousTotalFournisseur,
    remise: remiseFournisseur,
    livraison: livraisonFournisseur,
    tva: tvaFournisseur,
    total: totalFournisseur,
  });

  

  const savedCommande = await this.commandeRepository.save(commande);
  console.log('✅ Commande sauvegardée :', savedCommande);

  const client = await this.repo.findOne({
      where: { id: commande.client_id },
    });
const annee = new Date().getFullYear();
const fournisseur = await this.repo.findOne({
      where: { id: commande.fournisseur_id },
    });
   const fournisseurNom = fournisseur ? `${fournisseur.prenom} ${fournisseur.nom}` : 'Fournisseur inconnu';

        const clientNom = client ? `${client.prenom} ${client.nom}` : 'Client inconnu';

await this.notificationsGateway.sendNotificationToUser(
  fournisseurId,
    `🆕🛍️ Un nouveau commande #CMD-${annee}-${commande.id} du client: ${clientNom}.`
);

const admin = await this.findAdmin();

if (admin) {
  await this.notificationsGateway.sendNotificationToUser(
    admin.id,
    `🆕🛍️ Le client ${clientNom} a passer le commande  #CMD-${annee}-${commande.id} au fournisseur: ${fournisseurNom}.`
  );
} else {
  console.warn("Aucun administrateur trouvé pour la notification.");
}


  // Étape 3 : Créer les lignes CommandeProduit
  for (const item of itemsFournisseur) {
    const produit = await this.produitRepository.findOne({
      where: { id: item.produit_id },
    });

    if (!produit) {
      throw new NotFoundException(`Produit avec l'id ${item.produit_id} non trouvé`);
    }

    const commandeProduit = this.commandeProduitRepository.create({
      commande: savedCommande,
      produit,
      produit_id: produit.id,
      commande_id: savedCommande.id,
      quantite: item.quantite,
      prix: produit.prix,
      fournisseur_id: item.fournisseur_id,
    });

    await this.commandeProduitRepository.save(commandeProduit);

    console.log('🧾 CommandeProduit sauvegardé :', commandeProduit);
  }

  const commandeAvecRelations = await this.commandeRepository.findOne({
    where: { id: savedCommande.id },
    relations: {
      commandeProduits: {
        produit: true,
      },
    },
  });

  if (commandeAvecRelations) {
    commandesCreees.push(commandeAvecRelations);
    console.log('🔁 Commande avec relations ajoutée :', commandeAvecRelations);
  }
}


  console.log('✅ Toutes les commandes créées :', commandesCreees);
  return commandesCreees;
}

@Cron('0 0 * * *') // chaque jour à minuit
async handleCommandeExpiration() {
  const dixJours = new Date();
  dixJours.setDate(dixJours.getDate() - 10);

  await this.commandeRepository
    .createQueryBuilder()
    .delete()
    .where('date_creation < :dixJours', { dixJours })
    .execute();
}


  async findByClientId(clientId: number): Promise<Commande[]> {
    return this.commandeRepository.find({
      where: { client_id: clientId },
      relations: ['commandeProduits', 'commandeProduits.produit'], // si tu veux les relations
    });}

async findById(commandeId: number): Promise<Commande | null> {
  return this.commandeRepository.findOne({
    where: { id: commandeId },
    relations: ['commandeProduits', 'commandeProduits.produit'], // relations si besoin
  });
}

async findAdmin(): Promise<Utilisateur | null> {
  return this.repo.findOne({
    where: { role: 'admin' }, // ou statut si tu l'utilises à la place
  });
}

async validerCommande(commandeId: number): Promise<Commande> {
  const commande = await this.commandeRepository.findOne({
    where: { id: commandeId },
    relations: ['commandeProduits', 'commandeProduits.produit'],
  });

  if (!commande) {
    throw new NotFoundException(`Commande avec l'id ${commandeId} non trouvée`);
  }

  if (commande.statut === 'validé') {
    throw new Error(`Commande déjà validée`);
  }

  // 🔁 Mise à jour du stock pour chaque produit de la commande
  for (const cp of commande.commandeProduits) {
    const produit = cp.produit;

    if (produit.stock < cp.quantite) {
      throw new Error(`Stock insuffisant pour le produit ${produit.nom}`);
    }

    produit.stock -= cp.quantite;
    await this.produitRepository.save(produit);
  }

  // ✅ Changer le statut de la commande
  commande.statut = 'validé';
  const commandeValidee = await this.commandeRepository.save(commande);

const fournisseur = await this.repo.findOne({
      where: { id: commande.fournisseur_id },
    });

    const client = await this.repo.findOne({
      where: { id: commande.client_id },
    });
const annee = new Date().getFullYear();

    const fournisseurNom = fournisseur ? `${fournisseur.prenom} ${fournisseur.nom}` : 'Fournisseur inconnu';

        const clientNom = client ? `${client.prenom} ${client.nom}` : 'Client inconnu';

await this.notificationsGateway.sendNotificationToUser(
  commande.client_id,
  `✅ Votre commande #CMD-${annee}-${commande.id} a été validée par le fournisseur: ${fournisseurNom}.`
);

const admin = await this.findAdmin();

if (admin) {
  await this.notificationsGateway.sendNotificationToUser(
    admin.id,
    `✅🛍️ Le fournisseur ${fournisseurNom} a valider la commande  #CMD-${annee}-${commande.id} du client: ${clientNom}.`
  );
} else {
  console.warn("Aucun administrateur trouvé pour la notification.");
}

  return commandeValidee;
}
async commandeEnPreparation(commandeId: number): Promise<Commande> {
  const commande = await this.commandeRepository.findOne({
    where: { id: commandeId },
    relations: ['commandeProduits', 'commandeProduits.produit'],
  });

  if (!commande) {
    throw new NotFoundException(`Commande avec l'id ${commandeId} non trouvée`);
  }

  if (commande.statut === 'en préparation') {
    throw new Error(`Commande déjà en préparation`);
  }
  // ✅ Changer le statut de la commande
  commande.statut = 'en préparation';
  const commandeEnPreparation = await this.commandeRepository.save(commande);

const fournisseur = await this.repo.findOne({
      where: { id: commande.fournisseur_id },
    });

    const client = await this.repo.findOne({
      where: { id: commande.client_id },
    });
const annee = new Date().getFullYear();

    const fournisseurNom = fournisseur ? `${fournisseur.prenom} ${fournisseur.nom}` : 'Fournisseur inconnu';

        const clientNom = client ? `${client.prenom} ${client.nom}` : 'Client inconnu';

await this.notificationsGateway.sendNotificationToUser(
  commande.client_id,
  `🧰 Votre commande #CMD-${annee}-${commande.id} est en cours de préparation et sera prêt à être expédié.`
);

const admin = await this.findAdmin();

  return commandeEnPreparation;
}
async commandeExpedier(commandeId: number): Promise<Commande> {
  const commande = await this.commandeRepository.findOne({
    where: { id: commandeId },
    relations: ['commandeProduits', 'commandeProduits.produit'],
  });

  if (!commande) {
    throw new NotFoundException(`Commande avec l'id ${commandeId} non trouvée`);
  }

  if (commande.statut === 'expédiée') {
    throw new Error(`Commande déjà expédiée`);
  }

  commande.statut = 'expédiée';
  const commandeExpedier = await this.commandeRepository.save(commande);

const fournisseur = await this.repo.findOne({
      where: { id: commande.fournisseur_id },
    });

    const client = await this.repo.findOne({
      where: { id: commande.client_id },
    });
const annee = new Date().getFullYear();

    const fournisseurNom = fournisseur ? `${fournisseur.prenom} ${fournisseur.nom}` : 'Fournisseur inconnu';

        const clientNom = client ? `${client.prenom} ${client.nom}` : 'Client inconnu';

await this.notificationsGateway.sendNotificationToUser(
  commande.client_id,
  `🛫🚚 Votre commande #CMD-${annee}-${commande.id} est expédiée.`
);

const admin = await this.findAdmin();

 return commandeExpedier;
}
async commandeLivrer(commandeId: number): Promise<Commande> {
  const commande = await this.commandeRepository.findOne({
    where: { id: commandeId },
    relations: ['commandeProduits', 'commandeProduits.produit'],
  });

  if (!commande) {
    throw new NotFoundException(`Commande avec l'id ${commandeId} non trouvée`);
  }

  if (commande.statut === 'livrée') {
    throw new Error(`Commande déjà livrée`);
  }

  commande.statut = 'livrée';
  const commandeLivrer = await this.commandeRepository.save(commande);

const fournisseur = await this.repo.findOne({
      where: { id: commande.fournisseur_id },
    });

    const client = await this.repo.findOne({
      where: { id: commande.client_id },
    });
const annee = new Date().getFullYear();

    const fournisseurNom = fournisseur ? `${fournisseur.prenom} ${fournisseur.nom}` : 'Fournisseur inconnu';

        const clientNom = client ? `${client.prenom} ${client.nom}` : 'Client inconnu';

await this.notificationsGateway.sendNotificationToUser(
  commande.client_id,
  `🤝 Votre commande #CMD-${annee}-${commande.id} est livrée avec succès.`
);

const admin = await this.findAdmin();

 return commandeLivrer;
}
  async findAll(): Promise<Commande[]> {
    return this.commandeRepository.find({
      relations: ['commandeProduits', 'commandeProduits.produit'],
    });
  }
async annulerCommande(commandeId: number): Promise<string> {
  const commande = await this.commandeRepository.findOne({
    where: { id: commandeId },
    relations: ['commandeProduits', 'commandeProduits.produit'],
  });

  if (!commande) {
    throw new NotFoundException(`Commande avec l'id ${commandeId} non trouvée`);
  }

  if (commande.statut !== 'en attente') {
    throw new Error(`❌ Impossible d'annuler la commande car son statut est "${commande.statut}"`);
  }

  const client = await this.repo.findOne({ where: { id: commande.client_id } });
  const fournisseur = await this.repo.findOne({ where: { id: commande.fournisseur_id } });

  const clientNom = client ? `${client.prenom} ${client.nom}` : 'Client inconnu';
  const fournisseurNom = fournisseur ? `${fournisseur.prenom} ${fournisseur.nom}` : 'Fournisseur inconnu';
  const annee = new Date().getFullYear();

  // 🔔 Notification pour le fournisseur
  await this.notificationsGateway.sendNotificationToUser(
    commande.fournisseur_id,
    `❌ La commande #CMD-${annee}-${commande.id} du client ${clientNom} a été annulée.`
  );

  // 🔔 Notification pour l'administrateur
  const admin = await this.findAdmin();
  if (admin) {
    await this.notificationsGateway.sendNotificationToUser(
      admin.id,
      `⚠️❌ Le client ${clientNom} a annulé la commande #CMD-${annee}-${commande.id} destinée à ${fournisseurNom}.`
    );
  }

  // ✅ Supprimer d'abord les lignes CommandeProduit liées
  await this.commandeProduitRepository.delete({ commande_id: commande.id });

  // ✅ Supprimer la commande elle-même
  await this.commandeRepository.delete(commande.id);

  return `✅ Commande #CMD-${annee}-${commande.id} annulée et supprimée avec succès.`;
}


}
