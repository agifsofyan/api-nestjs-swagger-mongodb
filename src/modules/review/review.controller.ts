import {
	Controller,
	Get,
	Res,
	HttpStatus,
	Param,
	Body,
	Post,
	UseGuards,
    Query,
    Req
} from '@nestjs/common';

import {
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
	ApiQuery
} from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { PostReviewDTO, ReviewUID } from './dto/review.dto';
import { IUser } from '../user/interfaces/user.interface';
import { User } from '../user/user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';

const backoffice = ["ADMIN", "SUPERADMIN", "IT", "SALES"];
const client = ["USER"]
const all = backoffice.concat(client);

@ApiTags("Reviews_C")
@UseGuards(RolesGuard)
@Controller('review')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    /**
	 * @route   POST /api/v1/reviews
	 * @desc    Create a new review
	 * @access  Public
	 */

	@Post()
	@UseGuards(JwtGuard)
	@Roles(...client)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new review | Client' })

	async create(
        @Res() res,
        @User() user: IUser,
        @Body() input: PostReviewDTO,
    ) {
        input.user = user._id
		const result = await this.reviewService.create(input);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'The Review has been successfully created.',
			data: result
		});
    }
    
    /**
	 * @route   GET /api/v1/reviews
	 * @desc    Get all review
	 * @access  Public
	 */

	@Get()
	@UseGuards(JwtGuard)
	@Roles(...all)
	@ApiBearerAuth()
    @ApiOperation({ summary: 'Get all review | Client' })
    
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

	async all(@Req() req, @Res() res) {
		const result = await this.reviewService.all(req.query);

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
            message: 'The Review has been successfully render.',
            total: result.length,
			data: result
		});
    }
    
    /**
	 * @route   GET /api/v1/reviews/detail?id=:id or /api/v1/reviews/detail?product_id=:product_id or /api/v1/reviews/detail?user_id=:user_id
	 * @desc    Get review detail
	 * @access  Public
	 */

	@Get('detail')
	@UseGuards(JwtGuard)
	@Roles(...all)
	@ApiBearerAuth()
    @ApiOperation({ summary: 'Get review by ID | Backoffice' })

    @ApiQuery({
		name: 'uid',
		required: true,
		explode: true,
		type: String,
        isArray: false,
        enum: ReviewUID
    })
    
    @ApiQuery({
		name: 'value',
		required: true,
		explode: true,
		type: String,
		isArray: false
    })

    async byUID(
        @Query('uid') uid: string,
        @Query('value') value: string,
        @Res() res
    ) {
		const result = await this.reviewService.byUID(uid, value);

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
            message: 'The Review has been successfully render.',
			data: result
		});
    }
}
