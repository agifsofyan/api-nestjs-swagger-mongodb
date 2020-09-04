import { MongooseModule } from '@nestjs/mongoose';

import 'dotenv/config';

const {
	MONGO_DB_URI, 
	JWT_SECRET,
	JWT_EXPIRATION,
	JWT_ENCRYPT_SECRETKEY
} = process.env;

export const MONGO_DB_CONNECTION = MongooseModule.forRoot(MONGO_DB_URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});

export const JWT_SECRET_KEY = `${JWT_SECRET}`;
export const JWT_ENCRYPT_SECRET_KEY = `${JWT_ENCRYPT_SECRETKEY}`;
export const JWT_EXPIRATION_TIME = `${JWT_EXPIRATION}`;