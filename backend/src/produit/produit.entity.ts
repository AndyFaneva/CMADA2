import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { CategorieProduit } from 'src/categorie-produit/categorie-produit.entity';
import { CaracteristiqueProduit } from 'src/caracteristique-produit/caracteristique-produit.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Utilisateur } from 'src/Utilisateur/utilisateur.entity';

@Entity()
export class Produit {
  static map(arg0: (produit: any) => any) {
    throw new Error('Method not implemented.');
  }
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column('decimal')
  prix: number;

  @Column({ default: 0 })
  stock: number;

  @Column()
  tva:number;

  @Column({ nullable: true })
  stock_alert?: number;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column()
  reference: string;

  @Column()
  statut: string;

  @Column({ nullable: true})
  image?: string;

  @Column()
  ajouter_par:string;

  @Column()
  user_id:number;

 @ManyToOne(() => Utilisateur)
@JoinColumn({ name: 'user_id' })
fournisseur: Utilisateur;


@Column()
validation: string;

@ManyToOne(() => CategorieProduit, (categorie) => categorie.produits)
@JoinColumn({ name: 'categorie_id' })
categorie: CategorieProduit; 

    @Column({ nullable: true }) // Doit correspondre au nom dans la BD
  categorie_id?: number;

  @OneToMany(() => CaracteristiqueProduit, c => c.produit, { cascade: true })
  caracteristiques?: CaracteristiqueProduit[];

}