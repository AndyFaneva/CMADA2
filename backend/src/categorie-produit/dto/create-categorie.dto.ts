import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategorieDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Vêtements', required: true })
  nom: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Vêtements pour hommes et femmes', required: false })
  description?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ example: true, required: false })
  isActive?: boolean;
}

export class UpdateCategorieDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Électronique', required: false })
  nom?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Nouvelle description', required: false })
  description?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ example: false, required: false })
  isActive?: boolean;
}