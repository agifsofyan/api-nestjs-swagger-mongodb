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

import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';

import { TopicService } from './topic.service';
import {
	CreateTopicDTO,
	UpdateTopicDTO,
	ArrayIdDTO,
	Sort
} from './dto/topic.dto';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags("Topics")
@UseGuards(RolesGuard)
@Controller('topics')
export class TopicController {
	constructor(private readonly topicService: TopicService) { }

	/**
	 * @route   POST /api/v1/topics
	 * @desc    Create a new topic
	 * @access  Public
	 */

	@Post()
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new topic | Backofffice' })

	async create(@Res() res, @Body() createTopicDto: CreateTopicDTO) {
		const topic = await this.topicService.create(createTopicDto);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'The Topic has been successfully created.',
			data: topic
		});
	}

	/**
	 * @route   GET /api/v1/topics
	 * @desc    Get all topic
	 * @access  Public
	 */

	@Get()
	@ApiOperation({ summary: 'Get all topic | Free' })

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

		const topic = await this.topicService.findAll(req.query);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get topics`,
			total: topic.length,
			data: topic
		});
	}

	/**
	 * @route    Get /api/v1/topics/:id
	 * @desc     Get topic by ID
	 * @access   Public
	 */

	@Get(':id')
	@ApiOperation({ summary: 'Get topic by id' })

	@ApiParam({
		name: 'id',
		required: true,
		explode: true,
		type: String,
		example: '5fb636b3f5cdfe00749e0b05',
		description: 'Topic ID'
	})

	async findById(@Param('id') id: string, @Res() res)  {
		const topic = await this.topicService.findById(id);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get topic by id ${id}`,
			data: topic
		});
	}

	/**
	 * @route   Put /api/v1/topics/:id
	 * @desc    Update topic by Id
	 * @access  Public
	 **/

	@Put(':id')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update topic by id | Backofffice' })

	@ApiParam({
		name: 'id',
		required: true,
		explode: true,
		type: String,
		example: '5fb636b3f5cdfe00749e0b05',
		description: 'Topic ID'
	})

	async update(
		@Param('id') id: string,
		@Res() res,
		@Body() updateTopicDto: UpdateTopicDTO
	) {
		const topic = await this.topicService.update(id, updateTopicDto);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'The Topic has been successfully updated.',
			data: topic
		});
	}

	/**
	 * @route   Delete /api/v1/topics/:id
	 * @desc    Delete topic by ID
	 * @access  Public
	 **/

	@Delete(':id')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete topic | Backofffice' })

	@ApiParam({
		name: 'id',
		required: true,
		explode: true,
		type: String,
		example: '5fb636b3f5cdfe00749e0b05',
		description: 'Topic ID'
	})

	async delete(@Param('id') id: string, @Res() res){
		const topic = await this.topicService.delete(id);

		if (topic == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success remove topic by id ${id}`
			});
		}
	}

	/**
	 * @route   Delete /api/v1/topics/delete/multiple
	 * @desc    Delete topic by multiple ID
	 * @access  Public
	 **/

	@Delete('delete/multiple')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete multiple topic | Backofffice' })

	async deleteMany(@Res() res, @Body() arrayId: ArrayIdDTO) {
		const topic = await this.topicService.deleteMany(arrayId.id);
		if (topic == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success remove topic by id in: [${arrayId.id}]`
			});
		}
	}

	/**
	 * @route   Post /api/v1/topics/find/search
	 * @desc    Search topic by name
	 * @access  Public
	 **/

	@Post('multiple/clone')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Clone topics | Backofffice' })

	async clone(@Res() res, @Body() input: ArrayIdDTO) {

		const cloning = await this.topicService.insertMany(input)

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'Has been successfully cloned the topic.',
			data: cloning
		});
	}

	/**
	 * @route    Get /api/v1/topics/list/count
	 * @desc     Get topic list & count
	 * @access   Public
	 */

	@Get('list/count')
	@UseGuards(JwtGuard)
	@Roles("SUPERADMIN", "IT", "ADMIN", "USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get topic & count' })
	@ApiQuery({
		name: 'sort_product',
		required: false,
		explode: true,
		type: String,
		isArray: false,
		enum: Sort
	})

	@ApiQuery({
		name: 'limit',
		required: false,
		explode: true,
		type: Number,
		isArray: false
	})

	async listCount(
		@Res() res,
		@Query('sort_product') sort_product: string,
		@Query('limit') limit: number
	)  {
		const query = {sort_product,limit}
		const topic = await this.topicService.topicCountList(query);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get topics`,
			total: topic.length,
			data: topic
		});
	}
}
