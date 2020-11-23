import {
	Controller,
	Get,
	Res,
	HttpStatus,
	Req,
	Param,
	Body,
	Post,
	Put,
	Delete,
	UseGuards,
	Request
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
	ApiQuery
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { ProductService } from './product.service';
import {
	CreateProductDTO,
	UpdateProductDTO,
	ArrayIdDTO,
	SearchDTO
} from './dto/product.dto';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags('Products - [SUPERADMIN & ADMIN]')
@UseGuards(RolesGuard)
@Controller('products')
export class ProductController {
	constructor(private readonly productService: ProductService) { }

	/**
	 * @route   POST /api/v1/products
	 * @desc    Create a new product
	 * @access  Public
	 */

	@Post()
	@UseGuards(JwtAuthGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new product' })

	async create(@Request() req, @Res() res, @Body() createProductDto: CreateProductDTO) {
		const product = await this.productService.create(req.user.sub, createProductDto);
		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'The Product has been successfully created.',
			data: product
		});
	}

	/**
	 * @route   GET /api/v1/products
	 * @desc    Get all product
	 * @access  Public
	 */

	@Get()
	@ApiOperation({ summary: 'Get all product & Filter anything' })

	// Swagger Parameter [optional]
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

	@ApiQuery({
		name: 'optVal',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})

	@ApiQuery({
		name: 'optFields',
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

	async findAll(@Req() req, @Res() res) {
		const product = await this.productService.findAll(req.query);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get products`,
			total: product.length,
			data: product
		});
	}

	/**
	 * @route   Get /api/v1/products/:id
	 * @desc    Get product by Id
	 * @access  Public
	 **/

	@Get(':id')
	@ApiOperation({ summary: 'Get Product By Id' })

	async findById(@Param('id') id: string, @Res() res)  {
		const product = await this.productService.findById(id);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get product by id ${id}`,
			data: product
		});
	}

	/**
	 * @route   Get /api/v1/products/:slug/detail
	 * @desc    Get product by slug
	 * @access  Public
	 **/

	@Get(':slug/detail')
	@ApiOperation({ summary: 'Get Product By Slug' })

	async findBySlug(@Param('slug') slug: string, @Res() res)  {
		const product = await this.productService.findBySlug(slug);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get product by slug ${slug}`,
			data: product
		});
	}

	/**
	 * @route   Put /api/v1/products/:id
	 * @desc    Update product by Id
	 * @access  Public
	 **/

	@Put(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update product by id' })

	async update(
		@Param('id') id: string,
		@Res() res,
		@Body() updateProductDto: UpdateProductDTO,
		@Request() req
	) {
		const product = await this.productService.update(id, updateProductDto, req.user.sub);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'The Product has been successfully updated.',
			data: product
		});
	}

	/**
	 * @route   Delete /api/v1/products/:id
	 * @desc    Delete product by ID
	 * @access  Public
	 **/

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete product' })

	async delete(@Param('id') id: string, @Res() res){
		const product = await this.productService.delete(id);

		if (product == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success remove product by id ${id}`
			});
		}
	}

	/**
	 * @route   Delete /api/v1/products/delete/multiple
	 * @desc    Delete product by multiple ID
	 * @access  Public
	 **/

	@Delete('delete/multiple')
	@UseGuards(JwtAuthGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete multiple product' })

	async deleteMany(@Res() res, @Body() arrayId: ArrayIdDTO) {
		const product = await this.productService.deleteMany(arrayId.id);
		if (product == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success remove product by id in: [${arrayId.id}]`
			});
		}
	}

	/**
	 * @route   Post /api/v1/products/find/search
	 * @desc    Search product by name or description
	 * @access  Public
	 **/

	/**
	@Post('find/search')
	@ApiOperation({ summary: 'Search and show' })

	async search(@Res() res, @Body() search: SearchDTO) {
		const result = await this.productService.search(search);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success search product`,
			total: result.length,
			data: result
		});
	}
	*/

	/**
	 * @route   POST /api/v1/products/multiple/clone
	 * @desc    Clone products
	 * @access  Public
	 */

	@Post('multiple/clone')
	@UseGuards(JwtAuthGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Clone products' })

	async clone(@Res() res, @Body() input: ArrayIdDTO) {

		const cloning = await this.productService.insertMany(input)

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'Has been successfully cloned the product.',
			data: cloning
		});
	}
}
