import { IProduct } from '../product/interfaces/product.interface';
import { PaginateOptions } from './paginateopt';

async function paginate(query: any, options: PaginateOptions): Promise<{all: IProduct[]; pagination: any; maxPrice: number; minPrice: number}> {
    query = query || {};
    options = Object.assign({}, options);
  
    const sort = options.sort;
    // eslint-disable-next-line no-prototype-builtins
    const limit = options.hasOwnProperty('limit') ? options.limit : 10;
    const page = options.page || 1;
    // eslint-disable-next-line no-prototype-builtins
    const skip = options.hasOwnProperty('page') ? (page - 1) * limit : 0;
    const all = limit
      ? this.find(query).sort(sort).skip(skip).limit(limit).exec()
      : query.exec();
    const countDocuments = this.countDocuments(query).exec();
    const maxPrice = this.findOne({}).sort(`-${options.price}`).select(`${options.price}`)
    const minPrice = this.findOne({}).sort(`${options.price}`).select(`${options.price}`)
  
    const values = await Promise.all([all, countDocuments, maxPrice, minPrice]);
    return Promise.resolve({
        all: values[0],
        pagination: {
            total: values[1],
            limit: limit,
            page: page,
            pages: Math.ceil(values[1] / limit) || 1
        },
        maxPrice: values[2] ? values[2][options.price] : Infinity,
        minPrice: values[3] ? values[3][options.price] : 0,
    });
}
  
export const pagination = (schema: any): void => {
    schema.statics.paginate = paginate;
    this.paginate = paginate;
}