import { Document } from 'mongoose';

export interface IRating extends Document {
     user_id: string,
     kind: string;
     kind_id: string;
     rate: number;
}
