import {
    UseGuards,
    Controller,
    Get,
    Res,
    Req,
	Post,
	Put,
	Delete,
	Body,
	Param,
    HttpStatus,
	Request
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
	ApiQuery
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtGuard } from '../auth/guards/jwt.guard';

import { AdministratorService } from './administrator.service';

import {
	CreateAdminDTO,
	UpdateAdminDTO,
	ArrayIdDTO,
	SearchDTO
} from './dto/admin.dto';
import { OptQuery } from 'src/utils/OptQuery';
import { AuthLoginDTO } from 'src/auth/dto/login.dto';

var inRole = ["SUPERADMIN", "IT"];

@ApiTags('Admin - [SUPERADMIN]')
@UseGuards(RolesGuard)
@Controller('administrators')
export class AdministratorController {
    constructor(private readonly adminService: AdministratorService) {}

    /**
	 * @route   POST /api/v1/users
	 * @desc    Create a new user
	 * @access  Public
	 */
    @Post()
    /**
    @UseGuards(JwtGuard)
    @Roles(...inRole)
    @ApiBearerAuth()
    **/
    @ApiOperation({ summary: 'Add new administrator' })

    async addUser(@Res() res, @Body() createAdminDTO: CreateAdminDTO) {
        const user = await this.adminService.create(createAdminDTO);
        return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'Aministrator created successfully.',
			data: user
		});
	}

	/**
	 * @route   Put /api/v1/users/:id/update
	 * @desc    Update user by Id
	 * @access  Public
	 **/

	@Put(':id/update')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update User/Administrator by id' })

	async update(
		@Param('id') id: string,
		@Res() res,
		@Body() updateAdminDTO: UpdateAdminDTO
	) {
		const user = await this.adminService.update(id, updateAdminDTO);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'The User/Administrator has been successfully updated.',
			data: user
		});
	}

	/**
	 * @route   Get /api/v1/users
	 * @desc    Get all administrator
	 * @access  Public
	 **/

	@Get()
	@ApiOperation({ summary: 'Get all user' })

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
		const user = await this.adminService.findAll(req.query);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get users`,
			total: user.length,
			data: user
		});
	}

	/**
	 * @route    Get /api/v1/users/:id/detail
	 * @desc     Get user/administrator by ID
	 * @access   Public
	 */

	@Get(':id/detail')
	@ApiOperation({ summary: 'Get user by id' })

	async findById(@Param('id') id: string, @Res() res)  {
		const user = await this.adminService.findById(id);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get user by id ${id}`,
			data: user
		});
	}

	/**
	 * @route   Delete /api/v1/users/:id
	 * @desc    Delete user/aadministrator by ID
	 * @access  Public
	 **/

	@Delete(':id/delete')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete user/administrator' })

	async delete(@Param('id') id: string, @Res() res){
		const user = await this.adminService.delete(id);
		if (user == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success remove user/administrator by id ${id}`
			});
		}
	}

	/**
	 * @route   Delete /api/v1/users/delete/multiple
	 * @desc    Delete user/administrator by multiple ID
	 * @access  Public
	 **/

	@Delete('delete/multiple')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete multiple user/administrator' })

	async deleteMany(@Res() res, @Body() arrayId: ArrayIdDTO) {
		const user = await this.adminService.deleteMany(arrayId.id);
		if (user == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success remove user/administrator by id in: [${arrayId.id}]`
			});
		}
	}

	//  ###############################################
	/**
     * @route   POST api/v1/users/login
     * @desc    Authenticate user
     * @access  Public
     */

    @Post('login')

    @ApiOperation({ summary: 'Aministrator Login' })

    async login(@Res() res, @Body() authLoginDTO: AuthLoginDTO, @Request() request) {
        const result = await this.adminService.login(request, authLoginDTO)

        return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			result
		});
    }

    /**
     * @route   POST api/v1/users/me
     * @desc    Get Authenticate user
     * @access  Public
     */

    @Get('me')
    @UseGuards(JwtGuard)
    @Roles(...inRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'who am i' })
    async getUser(@Res() res, @Request() request) {
        const { sub, name, email, phone_number, role } = request.user

        const user = {
            _id: sub, name, email, phone_number, role
        }

        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			data: user
		});
    }
}
