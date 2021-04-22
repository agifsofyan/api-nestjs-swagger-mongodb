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
import { LMSService } from './lms.service';
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
} from './dto/lms.dto';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags("LMS-II")
@UseGuards(RolesGuard)
@Controller('lms')
export class LMSController {
    constructor(private readonly lmsService: LMSService) { }

    /**
	 * @route   GET /api/v1/lms
	 * @desc    Get LMS
	 * @access  Public
	 */
	@Get()
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get Dashboard | Client' })

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
		const userID = req.user._id
		const result = await this.lmsService.list(userID, req.query);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get LMS`,
			data: result
		});
	}

	/**
	 * @route   GET /api/v1/lms/:product_slug/home
	 * @desc    Get LMS detail
	 * @access  Public
	 */
	@Get(':product_slug/home')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'LMS Home | Client' })

	@ApiParam({
		name: 'product_slug',
		required: true,
		type: String,
		example: 'minisite-seo-2',
		description: 'Product Slug'
	})

	async detail(
		@Res() res, 
		@Param('product_slug') product_slug: string
	)  {
		const result = await this.lmsService.home(product_slug);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success get LMS home',
			data: result
		});
	}

	/**
	 * @route   GET /api/v1/lms/:product_slug/webinar
	 * @desc    Get LMS detail
	 * @access  Public
	 */
	 @Get(':product_slug/webinar')
	 @UseGuards(JwtGuard)
	 @Roles("USER")
	 @ApiBearerAuth()
	 @ApiOperation({ summary: 'LMS Webinar List | Client' })
 
	 @ApiParam({
		 name: 'product_slug',
		 required: true,
		 type: String,
		 example: 'minisite-seo-2',
		 description: 'Product Slug'
	 })
 
	 async webinar(
		 @Req() req,
		 @Res() res,
		 @Param('product_slug') product_slug: string
	 )  {
		 const userID = req.user._id
		 const result = await this.lmsService.webinar(product_slug, userID);
		 return res.status(HttpStatus.OK).json({
			 statusCode: HttpStatus.OK,
			 message: 'Success get LMS webinar',
			 data: result
		 });
	 }
}
