import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { prepareProduct } from '../utils';
import { IProductModel, IProduct } from './interfaces/product.interface';
import { FetchProductsDTO } from './dto/fetch-products';
import { IProductPagination } from './interfaces/product-pagination.interface';

@Injectable()
export class ProductService {
    constructor(@InjectModel('Product') private productModel: IProductModel) {}

    async fetch(fetchProductsDTO: FetchProductsDTO): Promise<IProductPagination> {
        const { page, sort, topic, search, maxPrice } = fetchProductsDTO;

        const searchQuery = search ? { slug: new RegExp(search, 'i'), visibility: 'publish' } : {};
        const topicQuery = topic ? { topic: new RegExp(topic, 'i') } : {};
        const maxPriceQuery = maxPrice ? { price: { $lte: maxPrice } } : {};

        const query = {
            ...searchQuery,
            ...topicQuery,
            ...maxPriceQuery
        };

        const options = {
            page: parseFloat(page),
            sort: this.prepareSort(sort),
            limit: 10,
            price: 'price'
        };

        const productPagination = await this.productModel.paginate(query, options);
        
        return {
            ...productPagination,
            all: productPagination.all.map((product: any) => prepareProduct(product))
        }
    }

    async searchProduct(query: string): Promise<string[]> {
        const products = await this.productModel.find({ slug: new RegExp(query, 'i') });
        return products.map((product: any) => product.name);
    }

    async fetchProductByName(name: string): Promise<IProduct> {
        const product = await this.productModel.findOne({ name });
        if (!product) {
            throw new NotFoundException('Product does not exist');
        }
        return product;
    }

    async fetchAllProducts(): Promise<IProduct[]> {
        const products = await this.productModel.find({});
        return products.map((product: any) => prepareProduct(product));
    }

    private prepareSort = (params: string) => {
        switch (params) {
          case 'newest':
            return `-created_at`;
          case 'oldest':
            return `created_at`;
          case 'price_asc':
            return `price`;
          case 'price_desc':
            return `-price`;
          default:
            return `-created_at`;
        }
    };
}
