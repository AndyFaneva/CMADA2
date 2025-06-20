import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Produit } from './produit.entity';
import { CategorieProduit } from 'src/categorie-produit/categorie-produit.entity';
import { CaracteristiqueProduit } from 'src/caracteristique-produit/caracteristique-produit.entity';
import { CreateProduitDto } from './dto/create-produit.dto';
import { CreateCaracteristiqueDto } from 'src/caracteristique-produit/dto/create-caracteristique-produit.dto';
import { map, Observable } from 'rxjs';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { Utilisateur } from 'src/Utilisateur/utilisateur.entity';

interface CaracteristiqueDTO {
  nom: string;
  valeur: string;
}

@Injectable()
export class NullInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data?.image === "null") {
          data.image = null;
        }
        return data;
      }),
    );
  }
}
export class ProduitService {
  categorieService: any;
  entityManager: any;
  constructor(
    @InjectEntityManager()
    private readonly entityManger:EntityManager,

    @InjectRepository(Produit)
    private readonly produitRepository: Repository<Produit>,

    @InjectRepository(CategorieProduit)
    private readonly categorieRepository: Repository<CategorieProduit>,

    @InjectRepository(CaracteristiqueProduit)
    private readonly caracteristiqueRepository: Repository<CaracteristiqueProduit>,

  private readonly notificationsGateway: NotificationsGateway,

@InjectRepository(Utilisateur)
      private readonly repo: Repository<Utilisateur>,
  ) {}

 async findAdmin(): Promise<Utilisateur | null> {
   return this.repo.findOne({
     where: { role: 'admin' }, // ou statut si tu l'utilises à la place
   });
 }
 async create(createProduitDto: CreateProduitDto): Promise<Produit> {
    const produit = this.produitRepository.create(createProduitDto);
    return this.produitRepository.save(produit);
  }

async createProduit(createProduitDto: CreateProduitDto, file?: Express.Multer.File) {
  // 1. Récupération de la catégorie
  const categorie = await this.categorieRepository.findOneBy({ 
    id: createProduitDto.categorie_id 
  });

  if (!categorie) {
    throw new BadRequestException('Catégorie non trouvée');
  }

  // 2. Création et sauvegarde du produit
  const produit = this.produitRepository.create({
    ...createProduitDto,
    categorie,
    image: createProduitDto.image,
  });

  const savedProduit = await this.produitRepository.save(produit); // 👈 produit.id est maintenant disponible

  // 3. Ajout des caractéristiques
  if (createProduitDto.caracteristiques?.length) {
    const caracteristiques = createProduitDto.caracteristiques.map(c => {
      return this.caracteristiqueRepository.create({
        nom: c.nom,
        valeur: c.valeur,
        produit: savedProduit, // 👈 relation avec le produit (non produit_id brut)
      });
    });

    await this.caracteristiqueRepository.save(caracteristiques);
  }
  const fournisseur = await this.repo.findOne({
      where: { id: savedProduit.user_id },
    });

    const fournisseurNom = fournisseur ? `${fournisseur.prenom} ${fournisseur.nom}` : 'Fournisseur inconnu';

const admin = await this.findAdmin();

if (admin) {
  await this.notificationsGateway.sendNotificationToUser(
    admin.id,
    `🆕 Nouveau produit ajouter par ${fournisseurNom}`
  );
} else {
  console.warn("Aucun administrateur trouvé pour la notification.");
}
  return savedProduit;
}

  async findByFournisseur(userId: number) {
    return this.produitRepository.find({
      where: {
        user_id: userId,
        ajouter_par: 'fournisseur',
      },
      relations:['categorie'],
    });
  }
  


  async update(id: number, dto: CreateProduitDto, file: Express.Multer.File) {
    try {
      const produit = await this.produitRepository.findOne({
        where: { id },
        relations: ['caracteristiques'],
      });

      if (!produit) throw new NotFoundException('Produit introuvable');

      // Mettre à jour les champs simples
      produit.nom = dto.nom;
      produit.prix = dto.prix;
      produit.stock = dto.stock || 0;
      produit.stock_alert = dto.stock_alert;
      produit.description = dto.description;
      produit.reference = dto.reference;
      produit.ajouter_par = dto.ajouter_par;
      produit.user_id = dto.user_id;
      produit.tva = dto.tva;
      produit.statut = dto.statut;
      if (file) {
        produit.image = file.filename;
      }
      produit.image = dto.image;

      // Mettre à jour la catégorie si besoin
      if (dto.categorie_id) {
        const categorie = await this.categorieRepository.findOne({
          where: { id: dto.categorie_id },
        });
        if (!categorie) throw new NotFoundException('Catégorie introuvable');
        produit.categorie = categorie;
      }

      await this.produitRepository.save(produit);

      // Supprimer les anciennes caractéristiques
      await this.caracteristiqueRepository.delete({ produit: { id: produit.id } });

      // Ajouter les nouvelles caractéristiques
      if (dto.caracteristiques && dto.caracteristiques.length > 0) {
        const nouvelles = dto.caracteristiques.map((c) =>
          this.caracteristiqueRepository.create({
            nom: c.nom,
            valeur: c.valeur,
            produit,
          }),
        );
        await this.caracteristiqueRepository.save(nouvelles);
      }

      return { message: 'Produit modifié avec succès', produit };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Erreur lors de la modification du produit');
    }
  }

  async supprimerProduit(id: number): Promise<void> {
    const result = await this.produitRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Produit avec id ${id} non trouvé`);
    }
  }

    async findOne(id: number): Promise<Produit> {
    const produit = await this.produitRepository.findOne({
      where: { id },
      relations: ['categorie', 'caracteristiques'], // si tu veux aussi charger les relations
    });

    if (!produit) {
      throw new NotFoundException(`Produit avec id ${id} non trouvé`);
    }

    return produit;
  }

   async updateValidation(id: number, validation: string): Promise<any> {
      const Produit = await this.produitRepository.findOneBy({ id });
    
      if (!Produit) {
        throw new NotFoundException('Produit non trouvé');
      }
    
      Produit.validation = validation;
      return this.produitRepository.save(Produit);
    }


  async findAll(): Promise<Produit[]> {
  return await this.produitRepository.find({
    relations: ['categorie', 'caracteristiques'], // Inclut les relations si tu veux les afficher
  });
}
}
