import { 
    UseGuards,
    Controller,
    Get,
    Res,
	Param,
    HttpStatus,
	NotFoundException
} from '@nestjs/common';
import { 
	ApiTags, 
	ApiOperation,
	ApiBearerAuth,
	ApiParam
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';

import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdministratorService } from '../administrator/administrator.service';
import { RoleService } from '../role/role.service';

const inRole = ["SUPERADMIN", "IT", "ADMIN", "SALES", "USER"];

@ApiTags('Agents')
@UseGuards(RolesGuard)
@Controller('agents')
export class AgentController {
    constructor(
	    private readonly adminService: AdministratorService,
	    private readonly roleService: RoleService
    ) {}

	@Get()
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get all agent | Backoffice & Client' })
	
	async findAll(@Res() res) {
		const value = { search: 'SALES' }
		const checkSellerRole = await this.roleService.search(value)

		if(!checkSellerRole){
			throw new NotFoundException(`Not Found Agent(Sales) Role`)
		}
		
		const roleId = checkSellerRole[0]._id
		
		const data = await this.adminService.find({
			role: {$in:[roleId]}
		});
		
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get agents`,
			total: data.length,
			data: data
		});
	}

	/**
	 * @route    Get /api/v1/users/:id
	 * @desc     Get user/administrator by ID
	 * @access   Public
	 */

	@Get(':id')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get Agent by id' })

	@ApiParam({
		name: 'id',
		required: true,
		explode: true,
		type: String,
		example: '5fc5dedf6c13c9001e8b85a9',
		description: 'get Administrator with Sales Role by ID'
	})

	async findById(@Param('id') id: string, @Res() res)  {
		const user = await this.adminService.findById(id);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get agent(sales) by id ${id}`,
			data: user
		});
	}
}
