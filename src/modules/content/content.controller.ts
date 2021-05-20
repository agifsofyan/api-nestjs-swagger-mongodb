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
import { ContentService } from './content.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtGuard } from '../auth/guards/jwt.guard';
import {
	CreateContentDTO,
	UpdateContentDTO,
	ArrayIdDTO
} from './dto/content.dto';
// import { CreateBlogDTO } from './dto/content-blog.dto';
// import { CreateFulfillmentDTO } from './dto/content-fulfillment.dto';
import { CreateBlogDTO } from './blog/dto/insert-blog.dto';
import { CreateFulfillmentDTO, PostTypeEnum, PlacementValue } from './fulfillment/dto/insert-fulfillment.dto';
import { BlogService } from './blog/blog.service';
import { FulfillmentService } from './fulfillment/fulfillment.service';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags("Contents")
@UseGuards(RolesGuard)
@Controller('contents')
export class ContentController {
	constructor(
		private readonly contentService: ContentService,
		private readonly blogService: BlogService,
		private readonly fulfillmentService: FulfillmentService,
	) { }

	/**
	 * @route   POST /api/v1/contents
	 * @desc    Create a new content
	 * @access  Public
	 */
	@Post()
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new content | Backoffice' })

	async create(
		@Res() res, 
		@Req() req,
		@Body() createContentDto: CreateContentDTO
	) {
		const author = req.user._id
		const content = await this.contentService.create(author, createContentDto);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'The Content has been successfully created.',
			data: content
		});
	}

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
		const content = await this.contentService.findAll(req.query);
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
		const content = await this.contentService.findById(id);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get content by id ${id}`,
			data: content
		});
	}

	/**
	 * @route   Put /api/v1/contents/:id
	 * @desc    Update content by Id
	 * @access  Public
	 **/

	@Put(':id')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update content by id | Backoffice' })

	@ApiParam({
		name: 'id',
		required: true,
		explode: true,
		type: String,
		example: '6020f062a444df37605200c6',
		description: 'Content ID'
	})

	async update(
		@Param('id') id: string,
		@Res() res,
		@Body() updateContentDto: UpdateContentDTO
	) {
		const content = await this.contentService.update(id, updateContentDto);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'The Content has been successfully updated.',
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
		const content = await this.contentService.delete(id);

		if (content == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Remove content by id ${id} is successful`
			});
		}
	}

	/**
	 * @route   Delete /api/v1/contents/delete/multiple
	 * @desc    Delete fullfillment by multiple ID
	 * @access  Public
	 **/

	@Delete('delete/multiple')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete multiple content | Backoffice' })

	async deleteMany(@Res() res, @Body() arrayId: ArrayIdDTO) {
		const fullfillment = await this.contentService.deleteMany(arrayId.id);
		if (fullfillment == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Rremove content by id in: [${arrayId.id}] is successful`
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
}
