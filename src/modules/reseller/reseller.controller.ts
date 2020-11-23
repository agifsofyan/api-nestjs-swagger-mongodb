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
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
	CreateResellerDTO,
	UpdateResellerDTO,
	ArrayIdDTO,
	SearchDTO
} from './dto/reseller.dto';
import { ResellerService } from './reseller.service';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags('Resellers  - [SUPERADMIN & ADMIN]')
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
	@UseGuards(JwtAuthGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new reseller' })

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
	@ApiOperation({ summary: 'Get all reseller' })

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
	@ApiOperation({ summary: 'Get reseller by id' })

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
	@UseGuards(JwtAuthGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update reseller by id' })

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
	@UseGuards(JwtAuthGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete reseller' })

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
	@UseGuards(JwtAuthGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete multiple reseller' })

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
	 * @route   Post /api/v1/resellers/find/search
	 * @desc    Search reseller by content
	 * @access  Public
	 **/

	/**
	@Post('find/search')
	@UseGuards(JwtAuthGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Search and show' })

	async search(@Res() res, @Body() search: SearchDTO) {
		const result = await this.resellerService.search(search);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success search reseller`,
			total: result.length,
			data: result
		});
	}
	*/

	/**
	 * @route   POST /api/v1/resellers/multiple/clone
	 * @desc    Clone resellers
	 * @access  Public
	 */

	@Post('multiple/clone')
	@UseGuards(JwtAuthGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Clone resellers' })

	async clone(@Res() res, @Body() input: ArrayIdDTO) {

		const cloning = await this.resellerService.insertMany(input)

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'Has been successfully cloned the reseller.',
			data: cloning
		});
	}
}
