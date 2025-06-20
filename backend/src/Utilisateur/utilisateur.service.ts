import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Utilisateur } from './utilisateur.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import * as bcrypt from 'bcryptjs';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';
import { UpdatePasswordDto } from './dto/updatePasswordDto';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UtilisateurService {
 async updatePhotoProfil(
    id: number,
    image: Express.Multer.File,
    updateData: UpdateUtilisateurDto
): Promise<Utilisateur> {
    const user = await this.repo.findOne({ where: { id } });
    
    if (!user) {
        throw new Error('Utilisateur non trouvé');
    }

    // Mise à jour des autres champs si présents
    if (updateData.nom) user.nom = updateData.nom;
    if (updateData.prenom) user.prenom = updateData.prenom;
    // ... autres champs à mettre à jour ...

    // Gestion de l'image
    if (image) {
        // Supprimer l'ancienne image si elle existe
        if (user.image_profil) {
            const oldImagePath = path.join(__dirname, '..', '..', 'uploads', user.image_profil);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Sauvegarder la nouvelle image
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(image.originalname);
        const filename = `profile-${id}-${uniqueSuffix}${ext}`;
        const uploadPath = path.join(__dirname, '..', '..', 'uploads', filename);

        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(path.dirname(uploadPath))) {
            fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
        }

        fs.writeFileSync(uploadPath, image.buffer);
        user.image_profil = filename;
    }

    return this.repo.save(user);
}
    constructor(
        @InjectRepository(Utilisateur)
        private readonly repo: Repository<Utilisateur>,
        private readonly mailService: MailService,
          private readonly notificationsGateway: NotificationsGateway,
        private jwtService: JwtService
    ){}

    findAll(): Promise<Utilisateur[]>{
        return this.repo.find();
    }

     findOne(id: number): Promise<Utilisateur | null> {
    return this.repo.findOneBy({ id });
  }

async findAdmin(): Promise<Utilisateur | null> {
  return this.repo.findOne({
    where: { role: 'admin' }, // ou statut si tu l'utilises à la place
  });
}


  async create(data: CreateUtilisateurDto): Promise<Utilisateur> {
    console.log('👉 Données reçues pour création :', data);
    const {
      mot_de_passe,
      confirmation_mot_de_passe,
      email,
      ...rest
    } = data;
  
    // ✅ Vérifie que les mots de passe correspondent
    if (mot_de_passe !== confirmation_mot_de_passe) {
      throw new Error('Les mots de passe ne correspondent pas.');
    }
  
    // ✅ Vérifie l'unicité de l'email
    const existingUser = await this.repo.findOne({ where: { email } });
    if (existingUser) {
      console.log("Un utilisateur utilise déjà cette adresse email");
      throw new ConflictException('Un compte avec cet email existe déjà.');
    }
  
    // ✅ Hash du mot de passe
    console.log('🔐 Hash du mot de passe en cours...');
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    console.log('✅ Mot de passe hashé.');
  
    // ✅ Prépare l'utilisateur à enregistrer
  const utilisateur = this.repo.create({
    email,
    mot_de_passe: hashedPassword,
    ...rest,

  });
  
    console.log('📦 Utilisateur préparé pour enregistrement :', utilisateur);
  
    // ✅ Enregistre en base
    console.log('💾 Enregistrement en base...');
    const savedUser = await this.repo.save(utilisateur);
  
    // ✅ Envoi de l'email de bienvenue
    console.log('📧 Envoi de l’e-mail de bienvenue à :', savedUser.email);
    try {
      await this.mailService.sendMail(
        savedUser.email,
        'Bienvenue sur C\'MADA Pro 🎉',
        `<table width="100%" cellpadding="0" cellspacing="0" border="0" 
          style="background-size: cover; background-position: center; padding: 40px; background-color:blue; border-radius:20px">
          <tr>
            <td align="center" style="color: white; font-family: Arial, sans-serif; font-size:24">
              <h1>Bonjour ${savedUser.prenom}, ${savedUser.nom}</h1>
              <p>Merci pour votre inscription.</p>
              <img src="https://res.cloudinary.com/ds3kiy1qo/image/upload/v1746685418/Cmada_swo0nc.png" alt="logo"/>
            </td>
          </tr>
        </table>`
      );
      console.log('✅ E-mail envoyé avec succès.');
    } catch (err) {
      console.error('❌ Échec de l’envoi de l’e-mail :', err.message);
    }
const admin = await this.findAdmin();

if (admin) {
  await this.notificationsGateway.sendNotificationToUser(
    admin.id,
    `👤 Un nouveau ${savedUser.role} s'est inscrit: ${savedUser.email}`
  );
} else {
  console.warn("Aucun administrateur trouvé pour la notification.");
}

    return savedUser;
  }
  
  

  async update(id: number, updateUtilisateurDto: UpdateUtilisateurDto): Promise<Utilisateur> {
    try {
      const utilisateur = await this.repo.findOne({where:{id}});
      if (!utilisateur) {
        throw new Error('Utilisateur introuvable');
      }
  
      // Mettre à jour les informations de l'utilisateur
      Object.assign(utilisateur, updateUtilisateurDto);
      
      await this.repo.save(utilisateur);
      return utilisateur;  // Retourner l'utilisateur mis à jour
    } catch (error) {
      console.error('Erreur dans le service de mise à jour de l\'utilisateur :', error);
      throw new Error('Erreur lors de la mise à jour dans le service');
    }
  }

    delete(id:number): Promise<any>{
        return this.repo.delete(id);
    }

    async findByEmail(email: string): Promise<Utilisateur | null> {
      console.log('Recherche de l\'utilisateur avec l\'email:', email);  // Log de l'email cherché
      const utilisateur = await this.repo.findOne({ where: { email } });
      if (utilisateur) {
        console.log('Utilisateur trouvé:', utilisateur);  // Log si utilisateur trouvé
      } else {
        console.log('Aucun utilisateur trouvé pour cet email');
      }
      return utilisateur;
    }
    
    async login(email: string, mot_de_passe: string): Promise<any> {
      console.log('Début de la connexion pour l\'email:', email);
      
      // Recherche l'utilisateur par email
      const utilisateur = await this.findByEmail(email);
      if (!utilisateur) {
        console.log('Erreur: utilisateur non trouvé pour l\'email:', email);
        throw new UnauthorizedException('Utilisateur non trouvé');
      }
    
      console.log('Utilisateur trouvé:', utilisateur); // Affiche les détails de l'utilisateur trouvé
      // Compare le mot de passe envoyé avec le mot de passe haché stocké dans la base de données
      const passwordValid = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
      console.log('voici',mot_de_passe , 'et ', utilisateur.mot_de_passe)
      console.log('Comparaison du mot de passe:', passwordValid ? 'Mot de passe valide' : 'Mot de passe invalide');
    
      // Si le mot de passe est incorrect, lance une exception
      if (!passwordValid) {
        console.log('Mot de passe invalide pour l\'utilisateur:', email);
        throw new UnauthorizedException('Mot de passe invalide');
      }
    
      // Crée un payload pour le JWT
      const payload = { 
        userId: utilisateur.id,
    email: utilisateur.email,
    role: utilisateur.role,
    statut: utilisateur.statut,
       };
      console.log('Payload pour JWT:', payload); // Affiche le payload avant de le signer
    
      // Génère un token JWT avec les informations de l'utilisateur
      const token = this.jwtService.sign(payload);
      console.log('Token JWT généré:', token); // Affiche le token généré
    
      // Retourne le token et les informations de l'utilisateur
      return {
        access_token: token,
        utilisateur, // Tu peux retourner les informations de l'utilisateur ici si besoin
      };
    }

    async updateStatut(id: number, statut: string): Promise<any> {
      const user = await this.repo.findOneBy({ id });
    
      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }
    
      user.statut = statut;
      return this.repo.save(user);
    }

    async findById(id: number) {
      console.log('ID reçu dans findById :', id);
      console.log('ID dans findById:', id, 'typeof id:', typeof id);
      return this.repo.findOne({ where: { id } });
    }
    
    async update1(id: number, updateDto: UpdateUtilisateurDto) {
      const utilisateur = await this.repo.findOneBy({ id });
      console.log('🔍 Utilisateur trouvé :', utilisateur);
    
      if (!utilisateur) {
        console.log('❌ Utilisateur non trouvé pour ID :', id);
        throw new NotFoundException('Utilisateur non trouvé');
      }
    
      console.log('📦 Données reçues pour mise à jour :', updateDto);
      console.log('🛠️ Avant mise à jour :', utilisateur);
    
      utilisateur.prenom = updateDto.prenom ?? utilisateur.prenom;
      utilisateur.nom = updateDto.nom ?? utilisateur.nom;
      utilisateur.email = updateDto.email ?? utilisateur.email;
      utilisateur.statut = updateDto.statut ?? utilisateur.statut;
      utilisateur.role = updateDto.role ?? utilisateur.role;
      utilisateur.telephone = updateDto.telephone ?? utilisateur.telephone;
      utilisateur.entreprise = updateDto.entreprise ?? utilisateur.entreprise;
      utilisateur.poste = updateDto.poste ?? utilisateur.poste;
    
      // Ajout de console.log pour suivi du mot de passe
      console.log('🔐 Tentative de mise à jour du mot de passe...');
      console.log('Valeur mot_de_passe :', updateDto.mot_de_passe);
      console.log('Valeur confirmation_mot_de_passe :', updateDto.confirmation_mot_de_passe);
    
      if (
        typeof updateDto.mot_de_passe === 'string' &&
        typeof updateDto.confirmation_mot_de_passe === 'string' &&
        updateDto.mot_de_passe.trim().length > 0 &&
        updateDto.confirmation_mot_de_passe.trim().length > 0
      ) {
        if (updateDto.mot_de_passe !== updateDto.confirmation_mot_de_passe) {
          console.log('⚠️ Les mots de passe ne correspondent pas');
          throw new BadRequestException('Les mots de passe ne correspondent pas');
        }
    
        console.log('✅ Les mots de passe sont valides et vont être hashés...');
        const hashed = await bcrypt.hash(updateDto.mot_de_passe, 10);
        console.log('🔒 Mot de passe hashé :', hashed);
        utilisateur.mot_de_passe = hashed;
      } else {
        console.log('ℹ️ Aucun nouveau mot de passe fourni ou champs vides. Le mot de passe ne sera pas modifié.');
      }
    
      console.log('✅ Après mise à jour des champs :', utilisateur);
    
      const saved = await this.repo.save(utilisateur);
      console.log('💾 Utilisateur enregistré en base :', saved);
    
      return saved;
    }
    

    async updatePassword(id: number, dto: UpdatePasswordDto) {
      const utilisateur = await this.repo.findOne({
        where: { id },
        select: ['id', 'mot_de_passe'] // 👈 important si mot_de_passe est caché
      });
    
      if (!utilisateur) {
        throw new NotFoundException('Utilisateur non trouvé');
      }
    
      console.log('Mot de passe actuel fourni :', dto.mot_de_passe_actuel);
      console.log('Mot de passe en base :', utilisateur.mot_de_passe);
    
      if (!dto.mot_de_passe_actuel || !utilisateur.mot_de_passe) {
        throw new BadRequestException('Les informations du mot de passe sont incomplètes.');
      }
    
      const isMatch = await bcrypt.compare(dto.mot_de_passe_actuel, utilisateur.mot_de_passe);
      if (!isMatch) {
        throw new BadRequestException('Mot de passe actuel incorrect');
      }
    
      if (dto.nouveau_mot_de_passe !== dto.confirmation_nouveau_mot_de_passe) {
        throw new BadRequestException('Les nouveaux mots de passe ne correspondent pas');
      }
    
      const hashed = await bcrypt.hash(dto.nouveau_mot_de_passe, 10);
      utilisateur.mot_de_passe = hashed;
    
      return this.repo.save(utilisateur);
    }
    
async findOne1(id: number): Promise<Utilisateur> {
  const user = await this.repo.findOneBy({ id });
  if (!user) {
    throw new NotFoundException('Utilisateur non trouvé');
  }
  return user;
}
    
    

}
