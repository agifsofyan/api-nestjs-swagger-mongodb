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
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RoleService } from './role.service';
import {
	CreateRoleDTO,
	UpdateRoleDTO,
	ArrayIdDTO,
	SearchDTO
} from './dto/role.dto';

var inRole = ["SUPERADMIN", "IT"];

@ApiTags('Roles - [SUPERADMIN]')
@UseGuards(RolesGuard)
@Controller('roles')
export class RoleController {
	constructor(private readonly roleService: RoleService) { }

	/**
	 * @route   POST /api/v1/roles
	 * @desc    Create a new role
	 * @access  Public
	 */
	@Post()
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new role' })

	async create(@Res() res, @Body() createRoleDto: CreateRoleDTO) {
		const role = await this.roleService.create(createRoleDto);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'The Role has been successfully created.',
			data: role
		});
	}

	/**
	 * @route   GET /api/v1/roles
	 * @desc    Get all role
	 * @access  Public
	 */
	@Get()
	@ApiOperation({ summary: 'Get all role' })

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
		const role = await this.roleService.findAll(req.query);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get roles`,
			total: role.length,
			data: role
		});
	}

	/**
	 * @route    Get /api/v1/roles/:id
	 * @desc     Get role by ID
	 * @access   Public
	 */

	@Get(':id')
	@ApiOperation({ summary: 'Get role by id' })

	async findById(@Param('id') id: string, @Res() res)  {
		const role = await this.roleService.findById(id);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get role by id ${id}`,
			data: role
		});
	}

	/**
	 * @route   Put /api/v1/roles/:id
	 * @desc    Update role by Id
	 * @access  Public
	 **/

	@Put(':id')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update role by id' })

	async update(
		@Param('id') id: string,
		@Res() res,
		@Body() updateRoleDto: UpdateRoleDTO
	) {
		const role = await this.roleService.update(id, updateRoleDto);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'The Role has been successfully updated.',
			data: role
		});
	}

	/**
	 * @route   Delete /api/v1/roles/:id
	 * @desc    Delete role by ID
	 * @access  Public
	 **/

	@Delete(':id')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete role' })

	async delete(@Param('id') id: string, @Res() res){
		const role = await this.roleService.delete(id);

		if (role == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success remove role by id ${id}`
			});
		}
	}

	/**
	 * @route   Delete /api/v1/roles/delete/multiple
	 * @desc    Delete role by multiple ID
	 * @access  Public
	 **/

	@Delete('delete/multiple')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete multiple role' })

	async deleteMany(@Res() res, @Body() arrayId: ArrayIdDTO) {
		const role = await this.roleService.deleteMany(arrayId.id);
		if (role == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success remove role by id in: [${arrayId.id}]`
			});
		}
	}

	/**
	 * @route   Post /api/v1/roles/find/search
	 * @desc    Search role by admin type
	 * @access  Public
	 **/

	/**
	@Post('find/search')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Search and show' })

	async search(@Res() res, @Body() search: SearchDTO) {
		const result = await this.roleService.search(search);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success search role`,
			total: result.length,
			data: result
		});
	}
	*/

	/**
	 * @route   POST /api/v1/roles/multiple/clone
	 * @desc    Clone roles
	 * @access  Public
	 */

	@Post('multiple/clone')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Clone roles' })

	async clone(@Res() res, @Body() input: ArrayIdDTO) {

		const cloning = await this.roleService.insertMany(input)

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'Has been successfully cloned the role.',
			data: cloning
		});
	}
}
