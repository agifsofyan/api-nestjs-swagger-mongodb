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
	UseGuards
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
	ApiQuery,
	ApiBody,
	ApiProperty
} from '@nestjs/swagger';
import { ContentService } from './content.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtGuard } from '../auth/guards/jwt.guard';
import {
	CreateContentDTO,
	UpdateContentDTO,
	ArrayIdDTO,
	SearchDTO
} from './dto/content.dto';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags("Contents_BC")
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
	@ApiOperation({ summary: 'Get all content | Free' })

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

	async findAll(@Req() req, @Res() res) {
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
	 * @route   Post /api/v1/contents/find/search
	 * @desc    Search content by name or content
	 * @access  Public
	 **/

	/**
	@Post('find/search')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Search and show' })

	async search(@Res() res, @Body() search: SearchDTO) {
		const result = await this.contentService.search(search);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success search content`,
			total: result.length,
			data: result
		});
	}
	*/
}
