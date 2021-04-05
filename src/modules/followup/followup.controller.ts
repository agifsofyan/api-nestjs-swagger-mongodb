import {
	Controller,
	Get,
	Res,
	HttpStatus,
	Req,
	Request,
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
	ApiParam
} from '@nestjs/swagger';

import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';

import { FollowupService } from './followup.service';
import {
	CreateFollowUpDTO,
	UpdateFollowUpDTO,
	ArrayIdDTO,
	SearchDTO
} from './dto/followup.dto';

var inRole = ["SUPERADMIN", "IT", "ADMIN", "SALES"];

@ApiTags("FollowUps")
@UseGuards(RolesGuard)
@Controller('followups')
export class FollowupController {
    constructor(private readonly followService: FollowupService) { }

	/**
	 * @route   POST /api/v1/followup
	 * @desc    Create a new followup
	 * @access  Public
	 */

	@Post()
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new follow up | Backoffice' })

	async create(@Request() req, @Res() res, @Body() createFollowDto: CreateFollowUpDTO) {
		const query = await this.followService.create(req.user._id, createFollowDto);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'The Follow Up has been successfully created.',
			data: query
		});
	}

	/**
	 * @route   GET /api/v1/followup
	 * @desc    Get all followup
	 * @access  Public
	 */

	@Get()
	@ApiOperation({ summary: 'Get all follow up | Free' })

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

		const query = await this.followService.findAll(req.query);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get all follow up`,
			total: query.length,
			data: query
		});
	}

	/**
	 * @route    Get /api/v1/followup/:id
	 * @desc     Get followup by ID
	 * @access   Public
	 */

	@Get(':id')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get follow up by id | Backoffice' })

	@ApiParam({
		name: 'id',
		required: true,
		explode: true,
		type: String,
		example: '5faca96bb753fb0029ba1996',
		description: 'Follow Up ID'
	})

	async findById(@Param('id') id: string, @Res() res)  {
		const query = await this.followService.findById(id);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get follow up by id ${id}`,
			data: query
		});
	}

	/**
	 * @route   Put /api/v1/followup/:id
	 * @desc    Update follow up by Id
	 * @access  Public
	 **/

	@Put(':id')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update follow up by id | Backoffice' })

	@ApiParam({
		name: 'id',
		required: true,
		explode: true,
		type: String,
		example: '5faca96bb753fb0029ba1996',
		description: 'Follow Up ID'
	})

	async update(
		@Req() req,
		@Param('id') id: string,
		@Res() res,
		@Body() updateFollowDto: UpdateFollowUpDTO
	) {
		const query = await this.followService.update(req.user._id, id, updateFollowDto);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'The Follow Up has been successfully updated.',
			data: query
		});
	}

	/**
	 * @route   Delete /api/v1/query/:id
	 * @desc    Delete query by ID
	 * @access  Public
	 **/

	@Delete(':id')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete follow up | Backoffice' })

	@ApiParam({
		name: 'id',
		required: true,
		explode: true,
		type: String,
		example: '5faca96bb753fb0029ba1996',
		description: 'Follow Up ID'
	})

	async delete(@Param('id') id: string, @Res() res){
		const query = await this.followService.delete(id);

		if (query == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success remove follow up by id ${id}`
			});
		}
	}

	/**
	 * @route   Delete /api/v1/followup/delete/multiple
	 * @desc    Delete follow up by multiple ID
	 * @access  Public
	 **/

	@Delete('delete/multiple')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete multiple follow up | Backoffice' })

	async deleteMany(@Res() res, @Body() arrayId: ArrayIdDTO) {
		const query = await this.followService.deleteMany(arrayId.id);
		if (query == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success remove follow by id in: [${arrayId.id}]`
			});
		}
	}
}
