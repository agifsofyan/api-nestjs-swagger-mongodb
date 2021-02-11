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
	ApiQuery
} from '@nestjs/swagger';
import { ContentService } from './content.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtGuard } from '../auth/guards/jwt.guard';
import {
	CreateContentDTO,
	UpdateContentDTO,
	ArrayIdDTO,
	AnswerModule
} from './dto/content.dto';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags("Content_LMS")
@UseGuards(RolesGuard)
@Controller('contents')
export class ContentController {
	constructor(private readonly contentService: ContentService) { }

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

	async create(@Res() res, @Body() createContentDto: CreateContentDTO) {
		const content = await this.contentService.create(createContentDto);

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
	@Roles("IT", "ADMIN", "SUPERADMIN", "USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get all content | Free' })

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

	@ApiQuery({
		name: 'trending',
		required: false,
		explode: true,
		type: Boolean,
		isArray: false
	})

	@ApiQuery({
		name: 'favorite',
		required: false,
		explode: true,
		type: Boolean,
		isArray: false
	})

	@ApiQuery({
		name: 'is_paid',
		required: false,
		explode: true,
		type: Boolean,
		isArray: false
	})

	async findAll(
		@Req() req, 
		@Res() res,
		@Query('trending') trending: boolean,
		@Query('favorite') favorite: boolean,
		@Query('is_paid') is_paid: boolean,
	) {
		const filter = {trending: trending, favorite: favorite, is_paid: is_paid}
		const userID = req.user._id
		const content = await this.contentService.findAll(userID, req.query, filter);
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

	/**
	 * @route    Get /api/v1/contents/:id
	 * @desc     Get content by ID
	 * @access   Public
	 */
	@Post('answer/:content_id')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Post Answer | Client' })

	@ApiQuery({
		name: 'module_id',
		required: true,
		explode: true,
		type: String,
		isArray: false
	})

	async postAnswer(
		@Res() res, 
		@Param('content_id') content_id: string,
		@Query('module_id') module_id: string,
		@Body() input: AnswerModule
	)  {
		const content = await this.contentService.postAnswer(content_id, module_id, input);
		console.log('input 0', input)
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success answer the question / mission`,
			data: content
		});
	}

	/**
	 * @route    Get /api/v1/contents/progress/:id?value=100
	 * @desc     Send Progress
	 * @access   Public
	 */
	@Post('progress/:id')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Post progress | Client' })

	@ApiQuery({
		name: 'value',
		example: 100, //in percent
		description: "progress content in percent (%)",
		required: true,
		explode: true,
		type: Number,
		isArray: false
	})

	async sendProgress(
		@Res() res, 
		@Param('id') id: string,
		@Query('value') value: number
	)  {
		const result = await this.contentService.sendProgress(id, value);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: result
		});
	}

	/**
	 * @route    Get /api/v1/contents/webinar
	 * @desc     Get Webinar content 
	 * @access   Public
	 */
	@Get('product/webinar')
	@UseGuards(JwtGuard)
	@Roles("IT", "ADMIN", "SUPERADMIN", "USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get webinar content | client' })

	async findByWebinar(@Res() res)  {
		const content = await this.contentService.findByWebinar();
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get webinar content`,
			data: content
		});
	}
}
