import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { hashSync } from 'bcrypt';

import { ProductsService } from 'src/products/products.service';

import { initialData } from './data/data-seed';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class SeedService {

  constructor( private readonly productsServices: ProductsService, @InjectRepository( User ) private readonly userRepository: Repository<User> ) {

  }

  async runSeed() {
    await this.deleteTables()

    const adminUser = await this.insertUser();

    await this.insertNewProducts( adminUser );
    return 'seed executed';
  }

  private async deleteTables() {
    await this.productsServices.deleteAllProducts();
    
    const queryBuilder = await this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();

  }

  private async insertUser() {

    const seedUsers = initialData.users;

    const users : User[] = [];

    seedUsers.forEach(({ password, ...user }) => users.push(this.userRepository.create( {
      password: hashSync( password, 10 ),
      ...user,
    } )));

    const dbUsers = await this.userRepository.save( users);

    return dbUsers[0]

  }

  private async insertNewProducts( user: User ) {
    await this.productsServices.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = products.map(product => this.productsServices.create( product, user ));

    return await Promise.all( insertPromises );
  }

}
