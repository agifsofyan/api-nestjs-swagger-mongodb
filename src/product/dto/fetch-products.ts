import { IsIn, IsNotEmpty } from 'class-validator';
import { SortOptions } from '../../utils/enum';

export class FetchProductsDTO {
    @IsNotEmpty()
    page: string;

    @IsIn([
        SortOptions.newest,
        SortOptions.oldest,
        SortOptions.price_asc,
        SortOptions.price_desc,
    ])
    sort: SortOptions;

    topic?: string;
    search?: string;
    maxPrice?: number;
}