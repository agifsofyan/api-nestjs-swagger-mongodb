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
	Query
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
	ApiQuery,
	ApiParam
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateBlogDTO, UpdateBlogDTO } from './blog/dto/insert-blog.dto';
import { CreateFulfillmentDTO, UpdateFulfillmentDTO, PostTypeEnum, PlacementValue } from './fulfillment/dto/insert-fulfillment.dto';
import { BlogService } from './blog/blog.service';
import { FulfillmentService } from './fulfillment/fulfillment.service';
import { dinamicSort } from 'src/utils/helper';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags("Contents")
@UseGuards(RolesGuard)
@Controller('contents')
export class ContentController {
	constructor(
		private readonly blogService: BlogService,
		private readonly fulfillmentService: FulfillmentService,
	) { }

	/**
	 * @route   GET /api/v1/contents
	 * @desc    Get all content
	 * @access  Public
	 */
	@Get()
	@UseGuards(JwtGuard)
	@Roles(...inRole, "USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get all content | Backoffice, Client' })

	// Swagger Parameter [optional]
	@ApiQuery({
		name: 'search',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})

	@ApiQuery({
		name: 'sortval',
		required: false,
		explode: true,
		type: String,
		isArray: false,
		example: 'desc'
	})

	@ApiQuery({
		name: 'sortby',
		required: false,
		explode: true,
		type: String,
		isArray: false,
		example: 'created_at'
	})

	@ApiQuery({
		name: 'value',
		required: false,
		explode: true,
		type: String,
		isArray: false,
		description: 'key to filter'
	})

	@ApiQuery({
		name: 'fields',
		required: false,
		explode: true,
		type: String,
		isArray: false,
		description: 'value to filter'
	})

	@ApiQuery({
		name: 'limit',
		required: false,
		explode: true,
		type: Number,
		isArray: false,
		example: 10,
		description: 'total render'
	})

	@ApiQuery({
		name: 'offset',
		required: false,
		explode: true,
		type: Number,
		isArray: false,
		example: 1,
		description: 'number page'
	})

	async findAll(
		@Req() req, 
		@Res() res,
	) {
		var content
		var { query } = req

		if(query.fields == 'isBlog'){
		    delete query.fields

		    if(query.value == true || query.value == 'true'){
			delete query.value
			content = await this.blogService.findAll(query)
		    }

		    if(query.value == false || query.value == 'false'){
			delete query.value
			content = await this.fulfillmentService.findAll(query)
		    }
		}else{
		    var arr = []

		    const blog = await this.blogService.findAll(query)
		    const fulfilment = await this.fulfillmentService.findAll(query)

		    if(blog.length > 0){
			arr.push(...blog)
		    }

		    if(fulfilment.length > 0){
			arr.push(...fulfilment)
		    }

		    content = arr

		    if(content.length > 0 && query.sortby && query.sortval){
			content = content.sort(dinamicSort(query.sortby, query.sortval))
		    }
		}

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get contents`,
			total: content.length,
			data: content
		});
	}

	/**
	 * @route    Get /api/v1/contents/:id
	 * @desc     Get content by ID
	 * @access   Public
	 */
	@Get(':id')
	@UseGuards(JwtGuard)
	@Roles("IT", "ADMIN", "SUPERADMIN", "USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get content by id | Free' })

	@ApiParam({
		name: 'id',
		required: true,
		explode: true,
		type: String,
		example: '6020f062a444df37605200c6',
		description: 'Content ID'
	})

	async findById(@Param('id') id: string, @Res() res)  {
		var content:any = await this.blogService.findById(id);

		if(content == 404){
			content = await this.fulfillmentService.findById(id)
		}

		if(content == 404){
			return res.status(404).json({
				statusCode: 404,
				message: 'content not found',
				error: 'Not Found'
			})
		}

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get content by id ${id}`,
			data: content
		});
	}

	/**
	 * @route   Delete /api/v1/contents/:id
	 * @desc    Delete content by ID
	 * @access  Public
	 **/
	@Delete(':id')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete content | Backoffice' })

	@ApiParam({
		name: 'id',
		required: true,
		explode: true,
		type: String,
		example: '6020f062a444df37605200c6',
		description: 'Content ID'
	})

	async delete(@Param('id') id: string, @Res() res){
		var content:any = await this.blogService.findById(id)

		if(content == 404){
		    content = await this.fulfillmentService.delete(id)
		}else{
		    content = await this.blogService.delete(id)
		}
		    
		if (content == 'ok') {
		    return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Remove content by id ${id} is successful`
		    });
		}
	}

	// New Content Input to backoffice
	/**
	 * @route   POST /api/v1/contents/v2/blog
	 * @desc    Create a new blog
	 * @access  Public
	*/
	@Post('v2/blog')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new blog | Backoffice' })
 
	async createBlog(
		@Res() res, 
		@Req() req,
		@Body() input: CreateBlogDTO
	) {
		const author = req.user._id
		const content = await this.blogService.create(author, input);
 
		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'The Blog has been successfully created.',
			data: content
		});
	}

	/**
	 * @route   POST /api/v1/contents/v2/fulfillment
	 * @desc    Create a new fulfillment
	 * @access  Public
	*/
	@Post('v2/fulfillment')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new fulfillment | Backoffice' })
 
	async createFulfillment(
		@Res() res, 
		@Req() req,
		@Body() input: CreateFulfillmentDTO
	) {
		const author = req.user._id
		const content = await this.fulfillmentService.create(author, input);
 
		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'The Fulfillment has been successfully created.',
			data: content
		});
	}

	/**
	 * @route   GET /api/v1/contents/v2/fulfillment/product_id/postlist
	 * @desc    get fulfillment post list
	 * @access  Public
	*/
	@Get('v2/fulfillment/:product_id/postlist')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Fulfillment Post List | Backoffice' })

	@ApiParam({
		name: 'product_id',
		required: true,
		explode: true,
		type: String,
		example: '602dda671e352b12bc226dfd',
		description: 'Product ID'
	})
 
	async postList(
		@Param('product_id') product_id: string,
		@Res() res
	) {
		const content = await this.fulfillmentService.postList(product_id);
 
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success Get The Fulfillment Post Listd.',
			data: content
		});
	}

	/**
	 * @route   PUT /api/v1/contents/v2/blog/id/update
	 * @desc    Update Blog
	 * @access  Public
	*/
	@Put('v2/blog/:id/update')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update Content(Blog) | Backoffice' })

	@ApiParam({
		name: 'id',
		required: true,
		explode: true,
		type: String,
		example: '60a4e2cf4ff77b35015c2db0',
		description: 'Content(Blog) ID'
	})
 
	async updateBlog(
		@Param('id') id: string,
		@Body() input: UpdateBlogDTO,
		@Res() res
	) {
		const content = await this.blogService.update(id, input);
 
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success update the content(Blog).',
			data: content
		});
	}

	/**
	 * @route   PUT /api/v1/contents/v2/fulfillment/id/update
	 * @desc    Update Fulfillment
	 * @access  Public
	*/
	@Put('v2/fulfillment/:id/update')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update Content(Fulfillment) | Backoffice' })

	@ApiParam({
		name: 'id',
		required: true,
		explode: true,
		type: String,
		example: '60a4f5d2cbc0fb2655ccb42a',
		description: 'Content(Fulfillment) ID'
	})
 
	async updateFulfillment(
		@Param('id') id: string,
		@Body() input: UpdateFulfillmentDTO,
		@Req() req,
		@Res() res
	) {
		const content = await this.fulfillmentService.update(id, input, req.user._id);
 
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success update the content(Fulfillment).',
			data: content
		});
	}

	/**
	 * @route   GET /api/v1/contents/v2/fulfillment/product_slug/detail
	 * @desc    GET FulfillmentDetail by product slug
	 * @access  Public
	*/
	@Get('v2/fulfillment/:product_slug/detail')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Fulfillment detail by product slug | Backoffice' })

	@ApiParam({
		name: 'product_slug',
		required: true,
		explode: true,
		type: String,
		example: 'product-bonus',
		description: 'Product Slug'
	})
 
	async fulfillmentDetail(
		@Param('product_slug') product_slug: string,
		@Res() res
	) {
		const content = await this.fulfillmentService.fulfillmentDetail(product_slug);
 
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success get Fulfillment Detail by product slug.',
			data: content
		});
	}
}
