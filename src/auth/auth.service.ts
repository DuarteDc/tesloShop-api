import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { compareSync, hashSync } from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';

import { JWTPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {

  constructor( @InjectRepository(User) private readonly userRepository: Repository<User>, private readonly jwtService: JwtService ) { }

  async create( createUserDto: CreateUserDto ) {
  
    try {

      const { password, ...userData } = createUserDto;
      const user = await this.userRepository.create({
        ...userData,
        password: hashSync( password, 10 )
      });
      await this.userRepository.save( user );
      return {
        ...user,
        token: this.getJWTToken({ email: user.email })
      }
    } catch (error) {
      this.handleExceptions( error );
    }

  }

  async login( loginUserDto: LoginUserDto ) {

    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({ 
      where: { email },
      select: { email: true, password: true }
    })

    if (!user || !compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid - Please check your credentials');

    return {
      ...user,
      token: this.getJWTToken({ email })
    }
  }

  private getJWTToken( payload: JWTPayload ) {
    return this.jwtService.sign( payload );
  }

  private handleExceptions(error : any) {
    if ( error.code === '23505' ) throw new BadRequestException( error.detail );

    console.log(error)
    throw new InternalServerErrorException( 'Please check server logs' );

  }

}



