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
import { 
	PlacementContent, 
	ContentType, 
	ContentKind, 
	SendAnswerDTO, 
	SendMissionDTO,
	MediaType
} from './dto/userproducts.dto';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags("LMS")
@UseGuards(RolesGuard)
@Controller('userproducts')
export class UserproductsController {
    constructor(private readonly userproductsService: UserproductsService) { }

    /**
	 * @route   GET /api/v1/userproducts
	 * @desc    Get LMS
	 * @access  Public
	 */
	@Get()
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get all user-products | Client' })

	// Swagger Parameter [optional]
	@ApiQuery({
		name: 'search',
		required: false,
		explode: true,
		type: String,
		isArray: false,
		example: 'In paragraph',
		description: 'Search data in content'
	})

	@ApiQuery({
		name: 'sortval',
		required: false,
		explode: true,
		type: String,
		isArray: false,
		example: 'asc',
		description: 'available is: asc | desc'
	})

	@ApiQuery({
		name: 'sortby',
		required: false,
		explode: true,
		type: String,
		isArray: false,
		example: 'expired_date'
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

	@ApiQuery({
		name: 'placement',
		required: false,
		explode: true,
		type: String,
		isArray: false,
		enum: PlacementContent,
		description: 'Content Placement'
	})

	@ApiQuery({
		name: 'content_type',
		required: false,
		explode: true,
		type: String,
		isArray: false,
		enum: ContentType,
		description: 'Content Type'
	})

	@ApiQuery({
		name: 'content_post_type',
		required: false,
		explode: true,
		type: String,
		isArray: false,
		enum: ContentKind,
		description: 'Content Post Type (Content Kind)'
	})

	@ApiQuery({
		name: 'favorite',
		required: false,
		explode: true,
		type: Boolean,
		isArray: false,
		description: 'Favorite Content'
	})
	
	@ApiQuery({
		name: 'trending',
		required: false,
		explode: true,
		type: Boolean,
		isArray: false,
		description: 'Trending Content'
	})

	@ApiQuery({
		name: 'topic',
		required: false,
		explode: true,
		type: String,
		isArray: true,
		description: 'Topic ID content product'
	})

	async findAll(
		@Req() req, 
		@Res() res,
	) {
		const user = req.user
		const result = await this.userproductsService.LMS_list(user, req.query);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get LMS`,
			total: result.length,
			data: result
		});
	}

	/**
	 * @route   GET /api/v1/userproducts/detail/:product_id
	 * @desc    Get LMS detail
	 * @access  Public
	 */
	@Get('detail/:product_id')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get user-product detail | Client' })

	@ApiParam({
		name: 'product_id',
		required: true,
		type: String,
		example: '6022405e948c8e001c35f633',
		description: 'LMS (User Product) ID'
	})

	async detail(
		@Res() res, 
		@Param('product_id') product_id: string
	)  {
		const result = await this.userproductsService.detail(product_id);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success get LMS detail',
			data: result
		});
	}

    /**
	 * @route    Get /api/v1/userproducts/progress/:product_id?value=100
	 * @desc     Send Progress
	 * @access   Public
	 */
	@Post('progress/:product_id')
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
		@Req() req,
		@Res() res, 
		@Param('product_id') product_id: string,
		@Query('value') value: number
	)  {
		const user = req.user
		const result = await this.userproductsService.sendProgress(user, product_id, value);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: result
		});
	}

	/**
	 * @route    Get /api/v1/userproducts/answer
	 * @desc     Send Progress
	 * @access   Public
	 */
	@Post('answer')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Post Answer | Client' })

	async sendAnswer(
		@Req() req,
		@Res() res, 
		@Body() input: SendAnswerDTO
	)  {
		const user = req.user
		const result = await this.userproductsService.sendAnswer(user, input);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: result
		});
	}

	/**
	 * @route    Get /api/v1/userproducts/mission
	 * @desc     Send Progress
	 * @access   Public
	 */
	@Post('mission')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Claims of mission success | Client' })

	async sendMission(
		@Req() req,
		@Res() res, 
		@Body() input: SendMissionDTO
	)  {
		const user = req.user
		const result = await this.userproductsService.sendMission(user, input);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: result
		});
	}
}
