import { 
    Controller,
    Get,
    Post,
	Req,
	Param,
	Res,
	Body
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiQuery
} from '@nestjs/swagger';

import { ProductService } from './product.service';
import { CreateRatingDTO } from './dto/product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductController {
    constructor(private productService: ProductService) {}

   	/**
     * @route   POST api/v1/products
     * @desc    Filter all product
     * @access  Public
     */
    @Post()
    @ApiOperation({ summary: 'Filter all product' })
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
    async filterProducts(@Req() req) {
        return await this.productService.filter(req.query);
	}
	
	/**
     * @route   GET api/v1/products
     * @desc    Get all product
     * @access  Public
     */
    @Get()
    @ApiOperation({ summary: 'Get all product' })
	async getProducts() {
		return await this.productService.fetch();
	}

	/**
     * @route   GET api/v1/products/search
     * @desc    Search product
     * @access  Public
     */
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
    async searchProduct(@Req() req) {
        return await this.productService.search(req.query);
	}
	
	// async rating(
	// 	@Param('id') id: string,
	// 	@Res() res,
	// 	@Body() createRatingDTO: CreateRatingDTO
	// ) {
	// 	return await this.productService.rating(id, createRatingDTO)
	// }
}
