import {
	Controller,
	Get,
	Res,
	HttpStatus,
	Query,
	Param,
	Body,
	Post,
	UseGuards
} from '@nestjs/common';

import {
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
	ApiQuery
} from '@nestjs/swagger';

import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RatingService } from './rating.service';
import {
	PushRatingDTO,
} from './dto/rating.dto';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags("Ratings_C")
@UseGuards(RolesGuard)
@Controller('ratings')
export class RatingController {
    constructor(private readonly ratingService: RatingService) { }

	/**
	 * @route   POST /api/v1/ratings/push
	 * @desc    Push e new element to rating
	 * @access  Public
	 */

	@Post('push')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Push new element to rating | Client' })

	async push(@Res() res, @Body() input: PushRatingDTO) {
		const result = await this.ratingService.push(input)

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'The Rating has been successfully Phised.',
			data: result
		});
	}

	/**
	 * @route   POST /api/v1/ratings/check
	 * @desc    Push e new element to rating
	 * @access  Public
	 */

	@Post('check')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Check element from rating | Client' })

	async storeCheck(@Res() res, @Body() input: PushRatingDTO) {
		const result = await this.ratingService.storeCheck(input)

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'The Rating has been successfully Phised.',
			data: result
		});
	}

	/**
	 * @route   POST /api/v1/ratings/check
	 * @desc    Push e new element to rating
	 * @access  Public
	 */

	@Get('average')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Average | Client' })
	@ApiQuery({
		name: 'kind',
		required: true,
		explode: true,
		type: String,
        isArray: false,
        example: 'category'
	})
	@ApiQuery({
		name: 'kind_id',
		required: true,
		explode: true,
		type: String,
        isArray: false,
        example: '5fb636b3f5cdfe00749e0b05'
	})

	async percentage(
		@Res() res, 
		@Query('kind') kind: string,
		@Query('kind_id') kind_id: string,
	) {
		const params = {kind: kind, kind_id: kind_id}

		const result = await this.ratingService.percentage(params)

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'Rating Average.',
			data: result
		});
	}
}
