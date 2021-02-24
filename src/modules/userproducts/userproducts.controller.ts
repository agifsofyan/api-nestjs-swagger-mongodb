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
import { UserproductsService } from './userproducts.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { ProgressDTO } from './dto/userproducts.dto';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags("LMS")
@UseGuards(RolesGuard)
@Controller('userproducts')
export class UserproductsController {
    constructor(private readonly userproductsService: UserproductsService) { }

    /**
	 * @route   GET /api/v1/contents
	 * @desc    Get all content
	 * @access  Public
	 */
	@Get()
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get all user-products | Client' })

	// Swagger Parameter [optional]
	@ApiQuery({
		name: 'sortval',
		required: false,
		explode: true,
		type: String,
		isArray: false,
		example: 'desc'
	})

	@ApiQuery({
		name: 'sortby',
		required: false,
		explode: true,
		type: String,
		isArray: false,
		example: 'created_at'
	})

	@ApiQuery({
		name: 'value',
		required: false,
		explode: true,
		type: String,
		isArray: false,
		description: 'value to filter'
	})

	@ApiQuery({
		name: 'fields',
		required: false,
		explode: true,
		type: String,
		isArray: false,
		description: 'key to filter'
	})

	@ApiQuery({
		name: 'limit',
		required: false,
		explode: true,
		type: Number,
		isArray: false,
		example: 10,
		description: 'total render'
	})

	@ApiQuery({
		name: 'offset',
		required: false,
		explode: true,
		type: Number,
		isArray: false,
		example: 1,
		description: 'number page'
	})

	@ApiQuery({
		name: 'done',
		required: false,
		explode: true,
		type: Boolean,
		isArray: false,
		example: false,
		description: 'Progress filter'
	})
	
	@ApiQuery({
		name: 'as_user',
		required: false,
		explode: true,
		type: Boolean,
		isArray: false,
		example: false,
		description: 'Only data on user'
	})

	async findAll(
		@Req() req, 
		@Res() res,
		@Query('done') done: boolean,
		@Query('as_user') as_user: boolean
	) {
		const userID = req.user._id
		const result = await this.userproductsService.LMS_list(userID, req.query, done, as_user);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get user-products`,
			total: result.length,
			data: result
		});
	}

    /**
	 * @route    Get /api/v1/userproducts/:product_id/progress?value=100
	 * @desc     Send Progress
	 * @access   Public
	 */
	@Post(':product_id/progress')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Post progress | Client' })

	@ApiParam({
		name: 'product_id',
		required: true,
		type: String,
		example: '6022405e948c8e001c35f633',
		description: 'Product ID'
	})

	@ApiQuery({
		name: 'value',
		example: 25, //in percent
		description: "progress content in percent (%)",
		required: true,
		explode: true,
		type: Number,
		isArray: false
	})

	async sendProgress(
		@Res() res, 
		@Param('id') id: string,
		@Query('value') value: number
	)  {
		const result = await this.userproductsService.sendProgress(id, value);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: result
		});
	}
}
