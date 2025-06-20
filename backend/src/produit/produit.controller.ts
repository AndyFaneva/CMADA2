import {
  Controller,
  Post,
  Put,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  Get,
  BadRequestException,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
  ForbiddenException,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateProduitDto } from './dto/create-produit.dto';
import { NullInterceptor, ProduitService } from './produit.service';
import { plainToInstance } from 'class-transformer';
import { validate, validateOrReject } from 'class-validator';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('produits')
@Controller('produits')
export class ProduitController {
  constructor(private readonly produitService: ProduitService) {}



  @Get()
  async findAll() {
    return this.produitService.findAll();
  }


// Controller
@Post()
@UseInterceptors(NullInterceptor)
@UseInterceptors(FileInterceptor('image', {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    }
  })
}))
@ApiConsumes('multipart/form-data')
async createProduit(
  @UploadedFile() file: Express.Multer.File,
  @Body() body: any
) {
  console.log('📦 Body brut reçu :', body);
  console.log('🖼️ Fichier reçu :', file);

  const getFirstValue = (value: any) => Array.isArray(value) ? value[0] : value;

  body.prix = parseFloat(getFirstValue(body.prix));
  body.tva = parseFloat(getFirstValue(body.tva));
  body.stock = parseInt(getFirstValue(body.stock), 10);
  body.stock_alert = parseInt(getFirstValue(body.stock_alert), 10);
  body.categorie_id = parseInt(getFirstValue(body.categorie_id), 10);
   body.user_id = parseInt(getFirstValue(body.user_id), 10);
    body.ajouter_par = String(getFirstValue(body.ajouter_par));

  let caracteristiquesRaw = getFirstValue(body.caracteristiques);
  try {
    if (caracteristiquesRaw) {
      if (typeof caracteristiquesRaw === 'string') {
        body.caracteristiques = JSON.parse(caracteristiquesRaw);
      } else {
        body.caracteristiques = caracteristiquesRaw;
      }
    } else {
      body.caracteristiques = [];
    }
  } catch (err) {
    console.error('❌ Erreur parsing caracteristiques:', err.message);
    throw new BadRequestException('caracteristiques doit être un tableau JSON valide');
  }

  const createProduitDto = plainToInstance(CreateProduitDto, body);

  try {
    await validateOrReject(createProduitDto);
    console.log('✅ DTO valide');
  } catch (errors) {
    console.error('❌ Erreurs de validation du DTO :', errors);
    throw new BadRequestException(errors);
  }

  // 🔥 Attribuer le nom du fichier à l'image
  if (file) {
    createProduitDto.image = file.filename;
  }

  console.log('🚀 Envoi vers le service...');
  return this.produitService.createProduit(createProduitDto, file);
}



  @Patch(':id/validation')
  async updateValidation(
    @Param('id') id: number,
    @Body('validation') validation: string,
  ) {
    console.log('Requête PATCH reçue pour mise à jour de la validation');
    console.log('ID du produit:', id);
    console.log('Nouvelle valeur de validation:', validation);

    if (!['accepter', 'refuser', 'false'].includes(validation)) {
      console.warn('Validation invalide reçue:', validation);
      throw new BadRequestException('validation invalide');
    }

    const result = await this.produitService.updateValidation(id, validation);
    console.log('Mise à jour effectuée avec succès, résultat :', result);

    return result;
  }

  // Route avec ID explicite
// ✅ D'abord les routes spécifiques
@UseGuards(AuthGuard('jwt'))
@Get('fournisseur/:id')
async getProduitsDuFournisseurById(@Param('id', ParseIntPipe) id: number, @Req() req) {
  const user = req.user;

  if (user.role !== 'fournisseur') {
    throw new ForbiddenException('Accès refusé');
  }

  if (user.id !== id) {
    throw new ForbiddenException('Vous ne pouvez pas accéder aux produits d’un autre fournisseur');
  }

  return this.produitService.findByFournisseur(id);
}





  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Données pour modifier un produit avec image optionnelle',
    type: CreateProduitDto,
  })

@Get('test')
getTest() {
  return 'produit route ok';
}

  update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateProduitDto: CreateProduitDto,
  ) {
    return this.produitService.update(id, updateProduitDto, file);
  }
  // ❌ Ensuite les routes avec :id
@Get(':id')
getProduitById(@Param('id', ParseIntPipe) id: number) {
  return this.produitService.findOne(id);
}
  @Delete(':id')
  async supprimer(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.produitService.supprimerProduit(id);
  }
}
