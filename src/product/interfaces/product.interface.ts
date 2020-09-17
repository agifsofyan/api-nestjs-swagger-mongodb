import { Model, Document, DocumentQuery } from 'mongoose';

import { ITopic }  from '../../topic/interfaces/topic.interface';
import { IUser } from '../../user/interfaces/user.interface';
import { IProductPagination } from './product-pagination.interface';
import { PaginateOptions } from '../../utils/paginateopt';
import { IProductWebinar } from './product-webinar.interface';

export interface IProduct extends Document {
    _id: string;
    code: string;
    type: string;
    name: string;
    slug: string; 
    visibility: string; 
    readonly topic: ITopic[];
    image_url: string;
    video_url: string;
    headline: string;
    description: string;
    feedback: string;
    time_period: string;
    price: string;
    created_by: string;
    updated_by: string;
    webinar: IProductWebinar[];
    sale_method: string; 
    product_redirect: string[];
    readonly reseller: IUser;
    image_bonus_url: string[];
    image_text_url: string[];
    image_product_url: string[];
    section: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface IProductModel extends Model<IProduct> {
    paginate(query: any, options: PaginateOptions): DocumentQuery<IProductPagination, IProduct>;
}