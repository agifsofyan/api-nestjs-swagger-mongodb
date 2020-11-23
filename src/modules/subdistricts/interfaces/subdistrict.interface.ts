import { Document } from 'mongoose';

export interface ISDistrict extends Document {
    urban: string;
    sub_district: string;
    city: string;
    province_code: string;
    postal_code: number;
}