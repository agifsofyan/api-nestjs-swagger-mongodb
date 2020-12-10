import { Document } from 'mongoose';

export interface ITemplate extends Document {
     template: string;
     name: string; // Unique
     description: string;
     type: string;
     by: any;
     versions: Array<{
          engine: string,
          tag: string,
          comment: string,
          active: boolean,
          createdAt: Date
     }>;
}
