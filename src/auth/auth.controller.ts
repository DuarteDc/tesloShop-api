import { Controller, Get, Post, Body, UseGuards, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto/';
import { User } from './entities/user.entity';

import { Auth, GetUser, RawHeaders } from './decorators/';

import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces/valid-roles.interfaces';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create( @Body() createUserDto: CreateUserDto ) {
    return this.authService.create( createUserDto );
  }

  @Post('login')
  login( @Body() loginUserDto: LoginUserDto ) {
    return this.authService.login( loginUserDto );
  }

  @Get('check-auth')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus( user );
  }


  @Get('private')
  @UseGuards(AuthGuard())
  privateRoute( @GetUser('email') user: User, @RawHeaders() rawHeaders: Array<String> ) {
    return {
      message: "hola xD",
      user,
      rawHeaders
    }
  }

  @Get('private2')
  @SetMetadata( 'roles', ['admin', 'user', 'super-user'] )
  @UseGuards( AuthGuard(), UserRoleGuard )
  privateRoute2( @GetUser() user: User ) {  
    return {
      user
    }
  }

  @Get('private3')
  @Auth( ValidRoles.admin )
  privateRoute3( @GetUser() user: User ) { 
    return {
      user
    }
  }

}
