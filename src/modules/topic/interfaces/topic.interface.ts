import { Document } from 'mongoose';

export interface ITopic extends Document {
     name: string; // Unique
     slug: string;
     icon: string;
     rating: string;
}
