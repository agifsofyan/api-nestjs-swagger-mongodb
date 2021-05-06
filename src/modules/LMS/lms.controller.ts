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
	MediaType,
	ModuleType
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

	/**
	 * @route   GET /api/v1/lms/:product_slug/module/:module_type
	 * @desc    Get LMS tips module
	 * @access  Public
	*/
	@Get(':product_slug/module/:module_type')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'LMS Module | Client' })
 
	@ApiParam({
		name: 'product_slug',
		required: true,
		type: String,
		example: 'product-bonus',
		description: 'Product Slug'
	})

	@ApiParam({
		name: 'module_type',
		required: true,
		type: String,
		enum: ModuleType,
		example: 'action',
		description: 'Module Type'
	})
 
	async module(
		@Res() res,
		@Param('product_slug') product_slug: string,
		@Param('module_type') module_type: string,
	)  { 
		const result = await this.lmsService.module(product_slug, module_type);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success get LMS module ' + module_type,
			data: result
		});
	}

	/**
	 * @route   Post /api/v1/lms/:product_slug/module/:id/answer
	 * @desc    Post LMS module
	 * @access  Public
	*/
	@Post(':product_slug/module/:id/answer')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Answer the LMS Module (question) | Client' })
 
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
		example: '603355b37d078958405f859b',
		description: 'Module (question) ID'
	})
 
	async answerTheModule(
		@Req() req,
		@Res() res,
		@Param('product_slug') product_slug: string,
		@Param('id') id: string,
		@Body() input: SendAnswerDTO
	)  { 
		const userID = req.user._id
		const result = await this.lmsService.answerTheModule(userID, product_slug, id, input);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success answer LMS module (question) ' + id,
			data: result
		});
	}

	/**
	 * @route    Post /api/v1/lms/:product_slug/module/:id/mission
	 * @desc     Claim the mission
	 * @access   Public
	*/
	@Post(':product_slug/module/:id/mission')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Claims of mission success | Client' })

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
		example: '6088d1165c2dc156fcee19e8',
		description: 'Module (mission) ID'
	})
 
	async claimMission(
		@Req() req,
		@Param('product_slug') product_slug: string,
		@Param('id') id: string,
		@Res() res,
	)  {
		const userID = req.user._id
		const result = await this.lmsService.claimMission(userID, product_slug, id);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Mission Completed',
			data: result
		});
	}
}
