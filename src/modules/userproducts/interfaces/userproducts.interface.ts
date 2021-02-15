import { Document } from 'mongoose';

export interface IUserProducts extends Document {
    user: string;
    product: string;
    type: string;
    topic: string[];
    progress: number;
    utm: string;
    expired_date: string;
}
