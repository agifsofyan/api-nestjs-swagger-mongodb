import { Document } from 'mongoose';

export interface IToken extends Document {
     name: string
     token: string
     created_date: Date
     expired_date: Date
     user: string
}
