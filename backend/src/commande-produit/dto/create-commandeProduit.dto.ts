// src/commande/dto/create-commande-produit.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class CreateCommandeProduitDto {
  @ApiProperty({ example: 1, description: "ID du produit" })
  @IsInt()
  produit_id: number;

  @ApiProperty({ example: 5, description: "Quantité commandée" })
  @IsInt()
  @IsPositive()
  quantite: number;

    @ApiProperty({ example: 2, description: "ID du fournisseur propriétaire du produit" })
  @IsNumber()
    fournisseur_id: number; 
}
