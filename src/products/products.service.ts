import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(@InjectRepository(Product) private readonly productRepository: Repository<Product>) { }

  async create(createProductDto: CreateProductDto) {
    try {
      const product = await this.productRepository.create(createProductDto);
      return await this.productRepository.save(product);
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;

    try {
      return await this.productRepository.find({
        take: limit,
        skip: offset,
      });
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findOne(query: string) {
    let product: Product;
    try {

      if (isUUID(query)) product = await this.productRepository.findOneBy({ 'id': query });
      else {
        const queryBuilder = await this.productRepository.createQueryBuilder();
        product = await queryBuilder.where('UPPER(title) =:title or slug=:slueg', {
          title: query.toUpperCase(),
          slug: query.toLocaleLowerCase(),
        }).getOne();
      }

      if (!product) throw new NotFoundException('Product not exist');

      return product;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto
    });

    if (!product) throw new NotFoundException(`Product with id: ${id} not Found`);

    return await this.productRepository.save( product );
  }

  async remove(id: string) {
    try {
      await this.findOne(id);
      return await this.productRepository.delete({ id });
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  private handleExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    if (error instanceof NotFoundException) throw error;

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, please check server logs');
  }
}
