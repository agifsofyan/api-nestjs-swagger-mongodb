import { Document } from 'mongoose';

export interface IRole extends Document {
     _id: any;
     adminType: string;
     readWrite: boolean;
}
