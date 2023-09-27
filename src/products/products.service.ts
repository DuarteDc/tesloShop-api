import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { ProductImage, Product } from './entities';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage) private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) { }

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = await this.productRepository.create({
        ...productDetails,
        images: images.map(url => this.productImageRepository.create({ url }))
      });
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
        relations: {
          images: true
        }
      });
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findOne(query: string) {
    let product: Product;
    try {

      if (isUUID(query))
        product = await this.productRepository.findOneBy({ 'id': query });
      else {
        const queryBuilder = await this.productRepository.createQueryBuilder('product');
        product = await queryBuilder.where('UPPER(title) =:title or slug=:slug', {
          title: query.toUpperCase(),
          slug: query.toLocaleLowerCase(),
        })
          .leftJoinAndSelect('product.images', 'productImages')
          .getOne();
      }

      if (!product) throw new NotFoundException('Product not exist');

      return product;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images = [], ...productToUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id, ...productToUpdate });

    const queryRunner = await this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map(url => this.productImageRepository.create({ url }))
      } else {
        product.images = await this.productImageRepository.findBy({ product: { id } });
      }

      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();

    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleExceptions(error);

    }


    if (!product) throw new NotFoundException(`Product with id: ${id} not Found`);

    return await this.productRepository.save(product);
  }

  async remove(id: string) {
    try {
      await this.findOne(id);
      return await this.productRepository.delete({ id });
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async deleteAllProducts() {
    const query = await this.productRepository.createQueryBuilder('product');
    return await query.delete().where({}).execute();
  }


  private handleExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    if (error instanceof NotFoundException) throw error;

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, please check server logs');
  }
}
