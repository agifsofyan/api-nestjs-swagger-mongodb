import 'dotenv/config';
// import { MulterExtendedModule } from 'nestjs-multer-extended';

export const AWS_CONFIG = {
    AWS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
    AWS_BUCKET: process.env.AWS_BUCKET,
    AWS_ACL: process.env.AWS_ACL,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ENDPOINT: process.env.AWS_ENDPOINT
};

// export const Multer_AWS = MulterExtendedModule.register({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: process.env.AWS_REGION,
//     bucket: process.env.AWS_BUCKET,
//     basePath: 'LARUNO_ASSETS',
//     fileSize: 1 * 1024 * 1024
// })
