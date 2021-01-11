import 'dotenv/config';

export const AWS_CONFIG = {
    AWS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
    AWS_BUCKET: process.env.AWS_BUCKET,
    AWS_ACL: process.env.AWS_ACL,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ENDPOINT: process.env.AWS_ENDPOINT
};
