import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Produit } from 'src/produit/produit.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class CaracteristiqueProduit {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'ID auto-généré' })
  id: number;

  @Column({ length: 100 })
  @ApiProperty({ example: 'Couleur', required: true })
  nom: string;
  

  @Column({ length: 255 })
  @ApiProperty({ example: 'Noir', required: true })
  valeur: string;

  @ManyToOne(() => Produit, produit => produit.caracteristiques)
  @JoinColumn({ name: 'produit_id' }) // Spécifie explicitement le nom de colonne
  produit: Produit;

  @Column({ name: 'produit_id' }) // Spécifiez le nom de colonne si différent
  produit_id: number;

  newCarac: Produit[];

}