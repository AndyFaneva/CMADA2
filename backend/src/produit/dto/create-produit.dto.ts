import { IsString, IsNumber, IsNotEmpty, ValidateNested, IsArray, IsOptional, IsNumberString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UseInterceptors } from '@nestjs/common';
import { NullInterceptor } from '../produit.service';

class CaracteristiqueDto {
  @IsString()
  @ApiProperty()
  nom: string;

  @IsString()
  @ApiProperty()
  valeur: string;
}

export class CreateProduitDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  nom: string;

  @IsNumber()
  @ApiProperty()
  prix: number;

    @IsNumber()
  @ApiProperty()
  tva: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, default: 0 })
  stock: number;

   @IsOptional()
  @IsNumber()
  stock_alert?: number;

   @IsOptional()
  @IsString()
  description?: string;

     @IsNotEmpty()
  @IsString()
  reference: string;

  @IsOptional()
  @IsString()
  image?:string ;

     @IsNotEmpty()
  @IsString()
  statut: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  ajouter_par: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty()
  user_id: number;

  @IsNumber()
  @IsOptional()
   @ApiProperty()
  categorie_id?: number;


  @IsString()
  @IsOptional()
  validation?:string;

 @IsArray()
 @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CaracteristiqueDto)
  caracteristiques?: CaracteristiqueDto[];
  
}