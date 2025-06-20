import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Produit } from 'src/produit/produit.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class CategorieProduit {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'ID auto-généré' })
  id: number;

  @Column({ length: 100, unique: true })
  @ApiProperty({ example: 'Électronique', required: true })
  nom: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ example: 'Appareils électroniques', required: false })
  description: string;

  @Column({ default: true })
  @ApiProperty({ example: true, description: 'Si la catégorie est active', required: false })
  isActive: boolean;

  @OneToMany(() => Produit, (produit) => produit.categorie)
  produits: Produit[];
}