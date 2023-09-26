import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';

import { initialData } from './data/data-seed';

@Injectable()
export class SeedService {

  constructor(private readonly productsServices: ProductsService) {

  }

  async runSeed() {
    await this.insertNewProducts();
    return 'seed executed';
  }

  private async insertNewProducts() {
    await this.productsServices.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = products.map(product => this.productsServices.create( product ));

    return await Promise.all( insertPromises );
  }

}
