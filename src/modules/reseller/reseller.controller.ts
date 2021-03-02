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
	ApiProperty,
	ApiParam
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtGuard } from '../auth/guards/jwt.guard';
import {
	CreateResellerDTO,
	UpdateResellerDTO,
	ArrayIdDTO,
	SearchDTO
} from './dto/reseller.dto';
import { ResellerService } from './reseller.service';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags("Resellers")
@UseGuards(RolesGuard)
@Controller('resellers')
export class ResellerController {
	constructor(private readonly resellerService: ResellerService) { }

	/**
	 * @route   POST /api/v1/resellers
	 * @desc    Create a new reseller
	 * @access  Public
	 */

	@Post()
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new reseller | Backofffice' })

	async create(@Res() res, @Body() createResellerDto: CreateResellerDTO) {
		const reseller = await this.resellerService.create(createResellerDto);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'The Reseller has been successfully created.',
			data: reseller
		});
	}

	/**
	 * @route   GET /api/v1/resellers
	 * @desc    Get all reseller
	 * @access  Public
	 */

	@Get()
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get all reseller | Backofffice' })

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
		const reseller = await this.resellerService.findAll(req.query);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get resellers`,
			total: reseller.length,
			data: reseller
		});
	}

	/**
	 * @route    Get /api/v1/resellers/:id
	 * @desc     Get reseller by ID
	 * @access   Public
	 */

	@Get(':id')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get reseller by id | Backofffice' })

	@ApiParam({
		name: 'id',
		required: true,
		explode: true,
		type: String,
		example: '5fb4c27a33d25d0d6810e92c',
		description: 'Reseller ID'
	})

	async findById(@Param('id') id: string, @Res() res)  {
		const reseller = await this.resellerService.findById(id);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get reseller by id ${id}`,
			data: reseller
		});
	}

	/**
	 * @route   Put /api/v1/resellers/:id
	 * @desc    Update reseller by Id
	 * @access  Public
	 **/

	@Put(':id')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update reseller by id | Backofffice' })

	@ApiParam({
		name: 'id',
		required: true,
		explode: true,
		type: String,
		example: '5fb4c27a33d25d0d6810e92c',
		description: 'Reseller ID'
	})

	async update(
		@Param('id') id: string,
		@Res() res,
		@Body() updateResellerDto: UpdateResellerDTO
	) {
		const reseller = await this.resellerService.update(id, updateResellerDto);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'The Reseller has been successfully updated.',
			data: reseller
		});
	}

	/**
	 * @route   Delete /api/v1/resellers/:id
	 * @desc    Delete reseller by ID
	 * @access  Public
	 **/

	@Delete(':id')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete reseller | Backofffice' })

	@ApiParam({
		name: 'id',
		required: true,
		explode: true,
		type: String,
		example: '5fb4c27a33d25d0d6810e92c',
		description: 'Reseller ID'
	})

	async delete(@Param('id') id: string, @Res() res){
		const reseller = await this.resellerService.delete(id);

		if (reseller == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success remove reseller by id ${id}`
			});
		}
	}

	/**
	 * @route   Delete /api/v1/resellers/delete/multiple
	 * @desc    Delete reseller by multiple ID
	 * @access  Public
	 **/

	@Delete('delete/multiple')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete multiple reseller | Backofffice' })

	async deleteMany(@Res() res, @Body() arrayId: ArrayIdDTO) {
		const reseller = await this.resellerService.deleteMany(arrayId.id);
		if (reseller == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success remove reseller by id in: [${arrayId.id}]`
			});
		}
	}

	/**
	 * @route   POST /api/v1/resellers/multiple/clone
	 * @desc    Clone resellers
	 * @access  Public
	 */

	@Post('multiple/clone')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Clone resellers | Backofffice' })

	async clone(@Res() res, @Body() input: ArrayIdDTO) {

		const cloning = await this.resellerService.insertMany(input)

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'Has been successfully cloned the reseller.',
			data: cloning
		});
	}
}
