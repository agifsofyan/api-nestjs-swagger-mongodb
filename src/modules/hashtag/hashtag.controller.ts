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
	ApiQuery
} from '@nestjs/swagger';

import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';

import { HashTagService } from './hashtag.service';
import { CreateHashTagDTO, UpdateHashTagDTO, ArrayIdDTO, SearchDTO } from './dto/hashtag.dto';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags("Hashtags_BC")
@UseGuards(RolesGuard)
@Controller('hashtags')
export class HashTagController {
	constructor(private readonly tagService: HashTagService) { }

	/**
	 * @route   POST /api/v1/hashtags
	 * @desc    Create a new hashtag
	 * @access  Public
	 */

	@Post()
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new hashtag | Backofffice' })

	async create(@Res() res, @Body() input: CreateHashTagDTO) {
		const hashtag = await this.tagService.create(input);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'The Hashtag has been successfully created.',
			data: hashtag
		});
	}

	/**
	 * @route   GET /api/v1/hashtags
	 * @desc    Get all hashtag
	 * @access  Public
	 */

	@Get()
	@ApiOperation({ summary: 'Get all hashtag | Free' })

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

		const hashtag = await this.tagService.findAll(req.query);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get hashtags`,
			total: hashtag.length,
			data: hashtag
		});
	}

	/**
	 * @route    Get /api/v1/hashtags/:id
	 * @desc     Get hashtag by ID
	 * @access   Public
	 */

	@Get(':id')
	@ApiOperation({ summary: 'Get hashtag by id' })

	async findById(@Param('id') id: string, @Res() res)  {
		const hashtag = await this.tagService.findOne("_id", id);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get hashtag by id ${id}`,
			data: hashtag
		});
	}

	/**
	 * @route   Put /api/v1/hashtags/:id
	 * @desc    Update hashtag by Id
	 * @access  Public
	 **/

	@Put(':id')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update hashtag by id | Backofffice' })

	async update(
		@Param('id') id: string,
		@Res() res,
		@Body() input: UpdateHashTagDTO
	) {
		const hashtag = await this.tagService.update(id, input);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'The Hashtag has been successfully updated.',
			data: hashtag
		});
	}

	/**
	 * @route   Delete /api/v1/hashtags/:id
	 * @desc    Delete hashtag by ID
	 * @access  Public
	 **/

	@Delete(':id')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete hashtag | Backofffice' })

	async delete(@Param('id') id: string, @Res() res){
		const hashtag = await this.tagService.delete(id);

		if (hashtag == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success remove hashtag by id ${id}`
			});
		}
	}

	/**
	 * @route   Delete /api/v1/hashtags/delete/multiple
	 * @desc    Delete hashtag by multiple ID
	 * @access  Public
	 **/

	@Delete('delete/multiple')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete multiple hashtag | Backofffice' })

	async deleteMany(@Res() res, @Body() arrayId: ArrayIdDTO) {
		const hashtag = await this.tagService.deleteMany(arrayId.id);
		if (hashtag == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success remove hashtag by id in: [${arrayId.id}]`
			});
		}
	}

	/**
	 * @route   Post /api/v1/hashtags/find/search
	 * @desc    Search hashtag by name
	 * @access  Public
	 **/

	/**
	@Post('find/search')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Search and show' })

	async search(@Res() res, @Body() search: SearchDTO) {
		const result = await this.tagService.search(search);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success search hashtag`,
			total: result.length,
			data: result
		});
	}
	*/

	// /**
	//  * @route   POST /api/v1/hashtags/multiple/clone
	//  * @desc    Clone hashtags
	//  * @access  Public
	//  */

	// @Post('multiple/clone')
	// @UseGuards(JwtGuard)
	// @Roles(...inRole)
	// @ApiBearerAuth()
	// @ApiOperation({ summary: 'Clone hashtags | Backofffice' })

	// async clone(@Res() res, @Body() input: ArrayIdDTO) {

	// 	const cloning = await this.tagService.insertMany(input)

	// 	return res.status(HttpStatus.CREATED).json({
	// 		statusCode: HttpStatus.CREATED,
	// 		message: 'Has been successfully cloned the hashtag.',
	// 		data: cloning
	// 	});
	// }

	// /**
	//  * @route    Get /api/v1/hashtags/list/count
	//  * @desc     Get hashtag list & count
	//  * @access   Public
	//  */

	// @Get('list/count')
	// @UseGuards(JwtGuard)
	// @Roles(...inRole)
	// @ApiBearerAuth()
	// @ApiOperation({ summary: 'Get hashtag & count' })

	// async listCount(@Res() res)  {
	// 	const hashtag = await this.tagService.hashtagCountList();
	// 	return res.status(HttpStatus.OK).json({
	// 		statusCode: HttpStatus.OK,
	// 		message: `Success get hashtags`,
	// 		data: hashtag
	// 	});
	// }
}
