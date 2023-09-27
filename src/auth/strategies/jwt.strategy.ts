import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../entities/user.entity';
import { JWTPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JWTStrategy extends PassportStrategy( Strategy ) {

    constructor(@InjectRepository( User ) private readonly userRepository: Repository<User>, configService: ConfigService) {
        super( {
            secretOrKey: configService.get('JWT_SECRET_KEY'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate( { email }: JWTPayload) : Promise<User> {

        const user = await this.userRepository.findOneBy({ email });

        if ( !user || !user.isActive) throw new UnauthorizedException('Token is not valid');

        return user;
    }

}
