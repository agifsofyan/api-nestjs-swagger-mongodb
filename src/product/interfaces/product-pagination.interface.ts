import { IProduct } from './product.interface';

export interface IProductPagination {
    all: IProduct[];
    total: number;
    limit: number;
    page: number;
    pages: number;
}