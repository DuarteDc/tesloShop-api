import { Response } from 'express';
import { BadRequestException, Controller, Param, Post, Get, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { fileFilter, fileNamer } from './helpers';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService, private readonly configService: ConfigService) { }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter,
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required or extension file is not valid');

    const secureUrl = `${ this.configService.get('HOST_API') }/files/products/${ file.filename }`;

    return { secureUrl }
  }


  @Get('product/:imageName')
  getProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ) {

    const path = this.filesService.getStaticProductImage( imageName );
    res.sendFile( path )

  }

}
