

export const fileFilter = async (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    if (!file) return callback(null, false);
    
    const [ _, fileExtension ] = file.mimetype.split('/');
       
    const validExtension = [ 'jpg', 'webp', 'jpeg', 'png' ];

    if (validExtension.includes(fileExtension)) return callback(null, true);

    callback(null, false);

}