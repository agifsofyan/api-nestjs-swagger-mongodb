import { 
    Controller,
    Get,
    Post,
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
    async getAllProducts(@Req() req: FastifyRequest) {
        return await this.productService.fetch(req.query);
    }

    @Get('/search')
	@ApiOperation({ summary: 'Search product by slug/topic' })
	@ApiQuery({
		name: 'product',
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
    async searchProduct(@Req() req: FastifyRequest) {
        return await this.productService.search(req.query);
    }
}
