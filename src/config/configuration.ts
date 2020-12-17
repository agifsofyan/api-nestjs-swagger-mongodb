import { MongooseModule } from '@nestjs/mongoose';
const Xendit = require('xendit-node');

import 'dotenv/config';

const {
	// MONGO_DB_URI,
	CLIENT_API_PORT,
	DB_USER,
	DB_PASS,
	DB_HOST,
	DB_PORT,
	DB_NAME, 
	DB_AUTH,
	JWT_SECRET,
	JWT_EXPIRATION,
	JWT_ENCRYPT_SECRETKEY,
	RAJAONGKIR_API_KEY,
	XENDIT_API_KEY,
    XENDIT_PUBLIC_KEY,
	XENDIT_CALLBACK_TOKEN,
	NINJA_ID,
	NINJA_KEY
} = process.env;

const URI = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=${DB_AUTH}`;

export const MONGO_DB_CONNECTION = MongooseModule.forRoot(URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});
export const XENDIT = new Xendit({ secretKey: XENDIT_API_KEY });
export const XENDIT_SECRET_KEY = `${XENDIT_API_KEY}`;

export const PORT = `${CLIENT_API_PORT}`;
export const MONGO_URI = `${URI}`;
export const JWT_SECRET_KEY = `${JWT_SECRET}`;
export const JWT_ENCRYPT_SECRET_KEY = `${JWT_ENCRYPT_SECRETKEY}`;
export const JWT_EXPIRATION_TIME = `${JWT_EXPIRATION}`;

export const RAJAONGKIR_SECRET_KEY = RAJAONGKIR_API_KEY;

export const X_TOKEN = Buffer.from(`${XENDIT_API_KEY}:`).toString('base64')

// export const X_SECRET_KEY = XENDIT_API_KEY
export const X_PUBLIC_KEY = XENDIT_PUBLIC_KEY
export const X_CALLBACK_TOKEN = XENDIT_CALLBACK_TOKEN

// Ninja
export const NINJAID = NINJA_ID
export const NINJAKEY = NINJA_KEY