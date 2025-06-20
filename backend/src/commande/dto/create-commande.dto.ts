// src/commande/dto/create-commande.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCommandeProduitDto } from 'src/commande-produit/dto/create-commandeProduit.dto';

export class CreateCommandeDto {
  @ApiProperty()
  @IsDateString()
  dateLivraison: string;

  @ApiProperty({ required: false })
  @IsOptional()
  remarques?: string;

  @ApiProperty()
  @IsNumber()
  sousTotal: number;

  @ApiProperty()
  @IsNumber()
  remise: number;

  @ApiProperty()
  @IsNumber()
  livraison: number;

  @ApiProperty()
  @IsNumber()
  tva: number;

  @ApiProperty()
  @IsNumber()
  total: number;

   @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty()
  client_id: number;

    @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty()
  fournisseur_id: number;

  @ApiProperty({ type: [CreateCommandeProduitDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateCommandeProduitDto)
  items: CreateCommandeProduitDto[];
}
