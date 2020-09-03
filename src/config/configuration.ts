import { MongooseModule } from '@nestjs/mongoose';

import 'dotenv/config';

const { 
	DB_USER, 
	DB_PASS, 
	DB_HOST, 
	DB_PORT, 
	DB_NAME, 
	DB_AUTH,
	JWT_SECRET,
	JWT_EXPIRATION,
	JWT_ENCRYPT_SECRETKEY
} = process.env;

const uri = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=${DB_AUTH}`;

export const MONGO_DB_CONNECTION = MongooseModule.forRoot(uri, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});

export const JWT_SECRET_KEY = `${JWT_SECRET}`;
export const JWT_ENCRYPT_SECRET_KEY = `${JWT_ENCRYPT_SECRETKEY}`;
export const JWT_EXPIRATION_TIME = `${JWT_EXPIRATION}`;