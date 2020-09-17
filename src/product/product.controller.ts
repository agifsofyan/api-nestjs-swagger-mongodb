import { 
    Controller,
    Get,
    Param,
    Query
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiQuery
} from '@nestjs/swagger';

import { FetchProductsDTO } from './dto/fetch-products';

import { ProductService } from './product.service';

@ApiTags('Products')
@Controller('products')
export class ProductController {
    constructor(private productService: ProductService) {}

    /**
     * @route   POST api/v1/products
     * @desc    Get all topic
     * @access  Public
     */
    @Get()
    @ApiOperation({ summary: 'Product queries' })
    @ApiQuery({
		name: 'page',
		required: false,
		explode: true,
		type: Number,
		isArray: false
	})
	@ApiQuery({
		name: 'sort',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})
	@ApiQuery({
		name: 'topic',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})
	@ApiQuery({
		name: 'search',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})
	@ApiQuery({
		name: 'maxPrice',
		required: false,
		explode: true,
		type: Number,
		isArray: false
	})
    getProducts(@Query() fetchProductsDTO: FetchProductsDTO) {
        return this.productService.fetch(fetchProductsDTO);
    }

    @Get('/search')
    @ApiOperation({ summary: 'Search product by querying slug' })
    getProductBySlug(@Query('query') query: string) {
        return this.productService.searchProduct(query);
    }

    @Get('/all')
    @ApiOperation({ summary: 'Get all products' })
    getAllProducts() {
        return this.productService.fetchAllProducts();
    }

    @Get('/:name')
    @ApiOperation({ summary: 'Get product by name' })
    getProductByName(@Param('name') name: string) {
        return this.productService.fetchProductByName(name);
    }
}
