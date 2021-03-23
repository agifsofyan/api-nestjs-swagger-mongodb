import { Document } from 'mongoose';

export interface IUTM extends Document {
     name: string;
     status: string;
}