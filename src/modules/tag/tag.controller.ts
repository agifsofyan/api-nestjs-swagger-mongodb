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

import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';

import { TagService } from './tag.service';
import { CreateTagDTO, UpdateTagDTO, ArrayIdDTO, CreateManyTagDTO } from './dto/tag.dto';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags("Tags_BC")
@UseGuards(RolesGuard)
@Controller('tags')
export class TagController {
	constructor(private readonly tagService: TagService) { }

	/**
	 * @route   POST /api/v1/tags
	 * @desc    Create a new tag
	 * @access  Public
	 */

	@Post()
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new tag | Backofffice' })

	async insertOne(@Res() res, @Body() input: CreateTagDTO) {
		const tag = await this.tagService.insertOne(input);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'The Tag has been successfully created.',
			data: tag
		});
	}

	/**
	 * @route   POST /api/v1/tags/many
	 * @desc    Create a new many tag
	 * @access  Public
	 */

	@Post('many')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new many tag | Backofffice' })

	async insertMany(@Res() res, @Body() input: CreateManyTagDTO) {
		const tag = await this.tagService.insertMany(input.tags);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'The Tag has been successfully created.',
			data: tag
		});
	}

	/**
	 * @route   GET /api/v1/tags
	 * @desc    Get all tag
	 * @access  Public
	 */

	@Get()
	@ApiOperation({ summary: 'Get all tag | Free' })

	// Swagger Parameter [optional]
	@ApiQuery({
		name: 'sort',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})

	@ApiQuery({
		name: 'name',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})

	async findAll(@Req() req, @Res() res) {

		const tag = await this.tagService.findAll(req.query);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get tags`,
			total: tag.length,
			data: tag
		});
	}

	/**
	 * @route    Get /api/v1/tags/:id
	 * @desc     Get tag by ID
	 * @access   Public
	 */

	@Get(':id')
	@ApiOperation({ summary: 'Get tag by id' })

	async findById(@Param('id') id: string, @Res() res)  {
		const tag = await this.tagService.findOne("_id", id);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get tag by id ${id}`,
			data: tag
		});
	}

	/**
	 * @route   Put /api/v1/tags/:id
	 * @desc    Update tag by Id
	 * @access  Public
	 **/

	@Put(':id')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update tag by id | Backofffice' })

	async update(
		@Param('id') id: string,
		@Res() res,
		@Body() input: UpdateTagDTO
	) {
		const tag = await this.tagService.update(id, input);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'The Tag has been successfully updated.',
			data: tag
		});
	}

	/**
	 * @route   Delete /api/v1/tags/:id
	 * @desc    Delete tag by ID
	 * @access  Public
	 **/

	@Delete(':id')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete tag | Backofffice' })

	async delete(@Param('id') id: string, @Res() res){
		const tag = await this.tagService.delete(id);

		if (tag == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success remove tag by id ${id}`
			});
		}
	}

	/**
	 * @route   Delete /api/v1/tags/delete/multiple
	 * @desc    Delete tag by multiple ID
	 * @access  Public
	 **/

	@Delete('delete/multiple')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete multiple tag | Backofffice' })

	async deleteMany(@Res() res, @Body() arrayId: ArrayIdDTO) {
		const tag = await this.tagService.deleteMany(arrayId.id);
		if (tag == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success remove tag by id in: [${arrayId.id}]`
			});
		}
	}

	/**
	 * @route   Delete /api/v1/tags/pull/:name/:type?id='xxxxxxsassas'
	 * @desc    Delete tag by multiple ID
	 * @access  Public
	 **/

	@Delete('pull/:name/:type')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'pull (product/order/content/coupon) from tag | Backofffice' })

	@ApiQuery({
		name: 'id',
		required: false,
		explode: true,
		type: String,
		isArray: true
	})

	async pullSome(
		@Param('name') name: string,
		@Param('type') type: string,
		@Query('id') id: any,
		@Res() res
	) {
		const tag = await this.tagService.pullSome(name, type, id);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success pull ${id} from ${type}`
		});
	}
}
