import { 
    Controller,
    Get,
    Post,
    Param,
    Query, 
    Req
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiQuery
} from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';

import { ProductService } from './product.service';

@ApiTags('Products')
@Controller('products')
export class ProductController {
    constructor(private productService: ProductService) {}

   /**
     * @route   POST api/v1/topics
     * @desc    Get all topic
     * @access  Public
     */
    @Post()
    @ApiOperation({ summary: 'Get all product (query: optional)' })
    @ApiQuery({
		name: 'sortval',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})
	@ApiQuery({
		name: 'sortby',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})
	@ApiQuery({
		name: 'value',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})
	@ApiQuery({
		name: 'fields',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		explode: true,
		type: Number,
		isArray: false
	})
	@ApiQuery({ 
		name: 'offset', 
		required: false, 
		explode: true, 
		type: Number, 
		isArray: false 
	})
    async getAllTopics(@Req() req: FastifyRequest) {
        return await this.productService.fetch(req.query);
    }

    @Get('/search')
    @ApiOperation({ summary: 'Search product by querying slug' })
    getProductBySlug(@Query('query') query: string, @Query('topic') topic: string) {
        return this.productService.searchProduct(query, topic);
    }

    @Get('/:name')
    @ApiOperation({ summary: 'Get product by name' })
    getProductByName(@Param('name') name: string) {
        return this.productService.fetchProductByName(name);
    }
}
