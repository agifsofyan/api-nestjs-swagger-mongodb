import { Document } from 'mongoose';

export interface IFollowUp extends Document {
     name: string; // Unique
     template: string;
     type: string;
     by: string;
}
