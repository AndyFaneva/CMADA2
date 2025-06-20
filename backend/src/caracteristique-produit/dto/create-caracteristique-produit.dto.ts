import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCaracteristiqueDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Mémoire', required: true })
  nom: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '16GB', required: true })
  valeur: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: 1, description: 'ID du produit associé', required: true })
  produitId: number;
}

export class UpdateCaracteristiqueDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Mémoire', required: false })
  nom?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '32GB', required: false })
  valeur?: string;
}