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
		example: 'product-bonus',
		description: 'Product Slug'
	})

	async home(
		@Req() req,
		@Res() res,
		@Param('product_slug') product_slug: string
	)  {
		const result = await this.lmsService.home(product_slug, req.user);
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
		example: 'product-bonus',
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

	/**
	 * @route   GET /api/v1/lms/:product_slug/video
	 * @desc    Get LMS detail
	 * @access  Public
	*/
	@Get(':product_slug/video')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'LMS Video List | Client' })
 
	@ApiParam({
		name: 'product_slug',
		required: true,
		type: String,
		example: 'product-bonus',
		description: 'Product Slug'
	})

	@ApiQuery({
		name: 'latest',
		required: false,
		type: Boolean,
		description: 'Sort to new'
	})

	@ApiQuery({
		name: 'recommendation',
		required: false,
		type: Boolean,
		description: 'Recommendation'
	})

	@ApiQuery({
		name: 'watched',
		required: false,
		type: Boolean,
		description: 'Watched'
	})
 
	async videoList(
		@Req() req,
		@Res() res,
		@Param('product_slug') product_slug: string
	)  {
		const userID = req.user._id
		const result = await this.lmsService.videoList(product_slug, userID, req.query);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success get LMS video list',
			data: result
		});
	}

	/**
	 * @route   GET /api/v1/lms/:product_slug/video/:video_id
	 * @desc    Get LMS detail
	 * @access  Public
	*/
	@Get(':product_slug/video/:video_id')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'LMS Video List | Client' })
 
	@ApiParam({
		name: 'product_slug',
		required: true,
		type: String,
		example: 'product-bonus',
		description: 'Product Slug'
	})

	@ApiParam({
		name: 'video_id',
		required: true,
		type: String,
		example: '6034e7a5ed1ee1608cfb1d8d',
		description: 'Video ID'
	})
 
	async videoDetail(
		@Param('product_slug') product_slug: string,
		@Param('video_id') video_id: string,
		@Res() res,
	)  {
		const result = await this.lmsService.videoDetail(product_slug, video_id);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success get LMS video detail',
			data: result
		});
	}

	/**
	 * @route   GET /api/v1/lms/:product_slug/tips
	 * @desc    Get LMS tips list
	 * @access  Public
	*/
	@Get(':product_slug/tips')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'LMS Video Tips List | Client' })
 
	@ApiParam({
		name: 'product_slug',
		required: true,
		type: String,
		example: 'product-bonus',
		description: 'Product Slug'
	})

	@ApiQuery({
		name: 'latest',
		required: false,
		type: Boolean,
		description: 'Sort to new'
	})

	@ApiQuery({
		name: 'recommendation',
		required: false,
		type: Boolean,
		description: 'Recommendation'
	})

	@ApiQuery({
		name: 'watched',
		required: false,
		type: Boolean,
		description: 'Watched'
	})
 
	async tipsList(
		@Req() req,
		@Res() res,
		@Param('product_slug') product_slug: string
	)  {
		const userID = req.user._id
		const result = await this.lmsService.tipsList(product_slug, userID, req.query);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success get LMS tips list',
			data: result
		});
	}

	/**
	 * @route   GET /api/v1/lms/:product_slug/tips/:id
	 * @desc    Get LMS tips detail
	 * @access  Public
	*/
	@Get(':product_slug/tips/:id')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'LMS Video Tips Detail | Client' })
 
	@ApiParam({
		name: 'product_slug',
		required: true,
		type: String,
		example: 'product-bonus',
		description: 'Product Slug'
	})

	@ApiParam({
		name: 'id',
		required: true,
		type: String,
		example: '6034e7a5ed1ee1608cfb1d7f',
		description: 'Content ID'
	})
 
	async tipsDetail(
		@Req() req,
		@Res() res,
		@Param('id') id: string,
		@Param('product_slug') product_slug: string,
	)  { 
		const result = await this.lmsService.tipsDetail(id, req.user, product_slug);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success get LMS tips detail',
			data: result
		});
	}
}
