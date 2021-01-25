import { Document } from 'mongoose';

export interface IRating extends Document {
     kind: string;
     kind_id: string;
     rate: Array<{
          user_id: string,
          count: number
     }>;
}
