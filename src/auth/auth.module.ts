import { InternalServerErrorException, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

import { JWTStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [ AuthController ],
  providers: [ AuthService, JWTStrategy ],
  imports: [ 
    ConfigModule,
    TypeOrmModule.forFeature([ User ]), 

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: ( configService: ConfigService ) => {

        const JWT_SECRET_KEY = configService.get('JWT_SECRET_KEY');
        if( !JWT_SECRET_KEY ) throw new InternalServerErrorException('Please configure .env file');
        return {
          secret: JWT_SECRET_KEY,
          signOptions: {
            expiresIn: '2h'
          }      
        }
      }
    })

    // JwtModule.register({
    //   secret: process.env.JWT_SECRET_KEY,
    //   signOptions: {
    //     expiresIn: '2h'
    //   }
    // })
  ],
  exports: [ TypeOrmModule, JWTStrategy, PassportModule, JwtModule ]
})
export class AuthModule {}
