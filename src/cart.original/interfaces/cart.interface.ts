import { IProduct } from '../../product/interfaces/product.interface';

export interface ICart {
    total_qty?: number;
    total_price?: number;
    items: IProduct[];
}