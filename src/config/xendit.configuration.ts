import 'dotenv/config';

const {
    XENDIT_API_KEY,
    XENDIT_PUBLIC_KEY,
    XENDIT_CALLBACK_TOKEN
} = process.env;

export const X_TOKEN = Buffer.from(`${XENDIT_API_KEY}:`).toString('base64')

export const X_SECRET_KEY = XENDIT_API_KEY
export const X_PUBLIC_KEY = XENDIT_PUBLIC_KEY
export const X_CALLBACK_TOKEN = XENDIT_CALLBACK_TOKEN
