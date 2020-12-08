import { Document } from 'mongoose';

export interface ITemplate extends Document {
     name: string; // Unique
     description: string;
     type: string;
     by: any;
}
