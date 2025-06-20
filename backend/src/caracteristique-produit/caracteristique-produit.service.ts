import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaracteristiqueProduit } from './caracteristique-produit.entity';
import { Produit } from 'src/produit/produit.entity';
import { CreateCaracteristiqueDto } from './dto/create-caracteristique-produit.dto';
import { UpdateCaracteristiqueDto } from './dto/create-caracteristique-produit.dto';

@Injectable()
export class CaracteristiqueProduitService {
  constructor(
    @InjectRepository(CaracteristiqueProduit)
    private readonly caractRepo: Repository<CaracteristiqueProduit>,
    @InjectRepository(Produit)
    private readonly produitRepo: Repository<Produit>,
  ) {}

  async create(dto: CreateCaracteristiqueDto): Promise<CaracteristiqueProduit> {
    const produit = await this.produitRepo.findOneBy({ id: dto.produitId });
    if (!produit) {
      throw new NotFoundException(`Produit avec ID ${dto.produitId} introuvable`);
    }

    const caract = this.caractRepo.create({
      nom: dto.nom,
      valeur: dto.valeur,
      produit,
    });

    return this.caractRepo.save(caract);
  }

  async findAllByProduit(produitId: number): Promise<CaracteristiqueProduit[]> {
    return this.caractRepo.find({
      where: { produit: { id: produitId } },
      relations: ['produit'],
    });
  }

  async update(
    id: number,
    dto: UpdateCaracteristiqueDto,
  ): Promise<CaracteristiqueProduit | null> {
    await this.caractRepo.update(id, dto);
    return this.caractRepo.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.caractRepo.delete(id);
  }

  async removeAllByProduit(produitId: number): Promise<void> {
    await this.caractRepo.delete({ produit: { id: produitId } });
  }
}