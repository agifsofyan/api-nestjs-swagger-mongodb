import { Document } from 'mongoose';

export interface IProvince extends Document {
    code: string;
    name: string;
    name_en: string;
}