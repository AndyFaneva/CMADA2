// src/commande/entities/commande.entity.ts

import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { CommandeProduit } from 'src/commande-produit/commande-produit.entity';

@Entity('commande')
export class Commande {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'date' })
  dateLivraison: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  remarques?: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sousTotal: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  remise: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  livraison: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  tva: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

    @Column()
  client_id:number;

      @Column()
  fournisseur_id:number;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column({ default: 'en_attente' })
  statut: string;

  @OneToMany(() => CommandeProduit, cp => cp.commande)
  commandeProduits: CommandeProduit[];
}
