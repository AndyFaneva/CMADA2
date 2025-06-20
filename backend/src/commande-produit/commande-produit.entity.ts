// commande-produit.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Produit } from "src/produit/produit.entity";
import { Commande } from "src/commande/commande.entity";

@Entity()
export class CommandeProduit {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Commande, (commande) => commande.commandeProduits)
  @JoinColumn({ name: "commande_id" })
  commande: Commande;

  @Column()
  commande_id: number;

  @ManyToOne(() => Produit, { eager: false })
  @JoinColumn({ name: "produit_id" })
  produit: Produit;

  @Column()
  produit_id: number;

  @Column()
fournisseur_id: number;


  @Column("int")
  quantite: number;
  

  @Column("decimal", { precision: 10, scale: 2 })
  prix: number;
}
