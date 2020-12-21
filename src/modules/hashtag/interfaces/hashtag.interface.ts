import { Document } from 'mongoose';

export interface IHashTag extends Document {
     name: string; // Unique
     content: [any];
}
