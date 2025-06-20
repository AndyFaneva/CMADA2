import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseIntPipe,
  Param,
  Get,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CaracteristiqueProduitService } from './caracteristique-produit.service';
import { CreateCaracteristiqueDto } from './dto/create-caracteristique-produit.dto';
import { UpdateCaracteristiqueDto } from './dto/create-caracteristique-produit.dto';
import { CaracteristiqueProduit } from './caracteristique-produit.entity';
import { CreateProduitDto } from 'src/produit/dto/create-produit.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';


@ApiTags('Caractéristiques Produit')
@Controller('caracteristiques-produit')
export class CaracteristiqueProduitController {
  constructor(private readonly service: CaracteristiqueProduitService) {}

   @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB max
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
    @Body() body: any,
  ) {
    // Parse et transforme 'caracteristiques' si présent
    if (body.caracteristiques) {
      try {
        body.caracteristiques = JSON.parse(body.caracteristiques);
      } catch (e) {
        throw new BadRequestException('caracteristiques invalides, JSON attendu');
      }
    }

    // Transforme en instance de DTO pour validation complète (nested + types)
    const produitDto = plainToInstance(CreateProduitDto, body);

    // Valide le DTO (avec nested validation)
    try {
      await validateOrReject(produitDto, { whitelist: true });
    } catch (errors) {
      throw new BadRequestException(errors);
    }

    // Appelle ton service pour enregistrer produit et fichier
    // Ex: this.produitService.create(produitDto, file);

    return {
      message: 'Produit créé avec succès',
      produit: produitDto,
      image: file ? file.filename : null,
    };
  }


  @Get('produit/:produitId')
  @ApiOperation({ summary: 'Lister les caractéristiques d\'un produit' })
  @ApiResponse({ status: 200, type: [CaracteristiqueProduit] })
  findByProduit(@Param('produitId', ParseIntPipe) produitId: number) {
    return this.service.findAllByProduit(produitId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une caractéristique' })
  @ApiResponse({ status: 200, type: CaracteristiqueProduit })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCaracteristiqueDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une caractéristique' })
  @ApiResponse({ status: 204 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}