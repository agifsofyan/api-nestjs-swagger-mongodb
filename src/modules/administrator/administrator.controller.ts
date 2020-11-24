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
import { AuthLoginDTO } from '../auth/dto/login.dto';

var inRole = ["SUPERADMIN", "IT"];

@ApiTags("Admins_B")
@UseGuards(RolesGuard)
@Controller('admins')
export class AdministratorController {
    constructor(private readonly adminService: AdministratorService) {}

    /**
	 * @route   POST /api/v1/admins
	 * @desc    Create a new admin
	 * @access  Public
	 */
    @Post()
    /**
    @UseGuards(JwtGuard)
    @Roles(...inRole)
    @ApiBearerAuth()
    **/
    @ApiOperation({ summary: 'Add new administrator | Backoffice' })

    async addUser(@Res() res, @Body() createAdminDTO: CreateAdminDTO) {
        const admin = await this.adminService.create(createAdminDTO);
        return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'Aministrator created successfully.',
			data: admin
		});
	}

	/**
	 * @route   Put /api/v1/admins/:id/update
	 * @desc    Update admin by Id
	 * @access  Public
	 **/

	@Put(':id/update')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update Administrator by id | Backoffice' })

	async update(
		@Param('id') id: string,
		@Res() res,
		@Body() updateAdminDTO: UpdateAdminDTO
	) {
		const admin = await this.adminService.update(id, updateAdminDTO);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'The Administrator has been successfully updated.',
			data: admin
		});
	}

	/**
	 * @route   Get /api/v1/admins
	 * @desc    Get all administrator
	 * @access  Public
	 **/

	@Get()
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get all admin | Backoffice' })

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
		console.log('req', req.user)
		const admin = await this.adminService.findAll(req.query);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get admins`,
			total: admin.length,
			data: admin
		});
	}

	/**
	 * @route    Get /api/v1/admins/:id/detail
	 * @desc     Get admin/administrator by ID
	 * @access   Public
	 */

	@Get(':id/detail')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get admin by id | Backoffice' })

	async findById(@Param('id') id: string, @Res() res)  {
		const admin = await this.adminService.findById(id);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get admin by id ${id}`,
			data: admin
		});
	}

	/**
	 * @route   Delete /api/v1/admins/:id
	 * @desc    Delete admin/aadministrator by ID
	 * @access  Public
	 **/

	@Delete(':id/delete')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete administrator' })

	async delete(@Param('id') id: string, @Res() res){
		const admin = await this.adminService.delete(id);
		if (admin == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success remove administrator by id ${id}`
			});
		}
	}

	/**
	 * @route   Delete /api/v1/admins/delete/multiple
	 * @desc    Delete admin/administrator by multiple ID
	 * @access  Public
	 **/

	@Delete('delete/multiple')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete multiple administrator | Backoffice' })

	async deleteMany(@Res() res, @Body() arrayId: ArrayIdDTO) {
		const admin = await this.adminService.deleteMany(arrayId.id);
		if (admin == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success remove administrator by id in: [${arrayId.id}]`
			});
		}
	}

	//  ###############################################
	/**
     * @route   POST api/v1/admins/login
     * @desc    Authenticate admin
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
     * @route   POST api/v1/admins/me
     * @desc    Get Authenticate admin
     * @access  Public
     */

    @Get('me')
    @UseGuards(JwtGuard)
    @Roles(...inRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'who am i | Backoffice' })
    async getUser(@Res() res, @Request() request) {
        const { sub, name, email, phone_number, role } = request.user

        const admin = {
            _id: sub, name, email, phone_number, role
        }

        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			data: admin
		});
    }
}