import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CategorieProduitService } from './categorie-produit.service';
import { CreateCategorieDto } from './dto/create-categorie.dto';
import { UpdateCategorieDto } from './dto/create-categorie.dto';
import { CategorieProduit } from './categorie-produit.entity';

@ApiTags('Catégories Produit')
@Controller('categories')
export class CategorieProduitController {
  constructor(private readonly service: CategorieProduitService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle catégorie' })
  @ApiResponse({ status: 201, type: CategorieProduit })
  create(@Body() dto: CreateCategorieDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister toutes les catégories' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: [CategorieProduit] })
  findAll(@Query('activeOnly') activeOnly?: boolean) {
    return this.service.findAll(activeOnly);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une catégorie par ID' })
  @ApiResponse({ status: 200, type: CategorieProduit })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une catégorie' })
  @ApiResponse({ status: 200, type: CategorieProduit })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategorieDto,
  ) {
    return this.service.update(id, dto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Activer/désactiver une catégorie' })
  @ApiResponse({ status: 200, type: CategorieProduit })
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une catégorie' })
  @ApiResponse({ status: 204 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}