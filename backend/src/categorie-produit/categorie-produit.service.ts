import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategorieProduit } from './categorie-produit.entity';
import { CreateCategorieDto } from './dto/create-categorie.dto';
import { UpdateCategorieDto } from './dto/create-categorie.dto';

@Injectable()
export class CategorieProduitService {
  constructor(
    @InjectRepository(CategorieProduit)
    private readonly categorieRepo: Repository<CategorieProduit>,
  ) {}

  async create(dto: CreateCategorieDto): Promise<CategorieProduit> {
    // Vérifie si la catégorie existe déjà
    const exists = await this.categorieRepo.findOne({ where: { nom: dto.nom } });
    if (exists) {
      throw new ConflictException('Une catégorie avec ce nom existe déjà');
    }

    const categorie = this.categorieRepo.create({
      nom: dto.nom,
      description: dto.description,
      isActive: dto.isActive ?? true,
    });

    return this.categorieRepo.save(categorie);
  }

  async findAll(onlyActive = false): Promise<CategorieProduit[]> {
    return this.categorieRepo.find({
      where: onlyActive ? { isActive: true } : {},
      relations: ['produits'],
    });
  }

  async findOne(id: number): Promise<CategorieProduit> {
    const categorie = await this.categorieRepo.findOne({
      where: { id },
      relations: ['produits'],
    });
    if (!categorie) {
      throw new NotFoundException(`Catégorie avec ID ${id} introuvable`);
    }
    return categorie;
  }

  async update(
    id: number,
    dto: UpdateCategorieDto,
  ): Promise<CategorieProduit> {
    const categorie = await this.findOne(id);
    return this.categorieRepo.save({ ...categorie, ...dto });
  }

  async toggleStatus(id: number): Promise<CategorieProduit> {
    const categorie = await this.findOne(id);
    categorie.isActive = !categorie.isActive;
    return this.categorieRepo.save(categorie);
  }

  async remove(id: number): Promise<void> {
    const categorie = await this.findOne(id);
    await this.categorieRepo.remove(categorie);
  }
}