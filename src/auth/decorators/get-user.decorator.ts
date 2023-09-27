import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const GetUser = createParamDecorator(
    ( data: string, ctx: ExecutionContext ) => {
        const { user } = ctx.switchToHttp().getRequest();
        if( !user ) 
            throw new InternalServerErrorException('User not found in request object');

        return data ? user[data] : user;
    }
)