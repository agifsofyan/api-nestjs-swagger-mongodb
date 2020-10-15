import { 
    Controller,
    Get,
    Post,
	Req,
	Param, 
	Res,
	HttpStatus,
	HttpService,
	UseGuards
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
	ApiQuery,
	ApiBearerAuth
} from '@nestjs/swagger';

import { ProductService } from './product.service';
import { UserGuard } from '../auth/guards/user.guard';

var { BACKOFFICE_API_PORT, CLIENT_IP } = process.env

var baseUrl = `http://${CLIENT_IP}:${BACKOFFICE_API_PORT}/api/v1`;

@ApiTags('Products')
@Controller('products')
export class ProductController {
    constructor(
		private productService: ProductService,
		private http: HttpService
	) {}

   	/**
     * @route   POST api/v1/products
     * @desc    Filter all product
     * @access  Public
     */
	@Post()
	@UseGuards(UserGuard)
    @ApiBearerAuth()
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
	@UseGuards(UserGuard)
    @ApiBearerAuth()
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
	@UseGuards(UserGuard)
    @ApiBearerAuth()
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

	/**
     * @route   GET api/v1/products/:id
     * @desc    Get detail product by ID
     * @access  Public
    */

	@Get(':slug')
	@UseGuards(UserGuard)
    @ApiBearerAuth()
	@ApiOperation({ summary: 'get detail product by slug' })

	async findById(@Param('slug') slug: string, @Res() res)  {

		try{
			const result = await this.http.get(`${baseUrl}/products/${slug}/detail`).toPromise()
			return res.status(HttpStatus.OK).json(result.data.data)
		} catch(err) {
			const {statusCode, message, error} = err.response.data
			return res.status(statusCode).json({
				statusCode: statusCode,
				message: message,
				error: error
			})
		}
	}
}
