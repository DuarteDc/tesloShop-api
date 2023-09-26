import { v4 as uuid } from 'uuid';

export const fileNamer = async (req: Express.Request, file: Express.Multer.File, callback: Function) => {
    
    const [ _, fileExtension ] = file.mimetype.split('/');
       
    const fileName = `${uuid()}.${fileExtension}`;

    callback(null, fileName);

}