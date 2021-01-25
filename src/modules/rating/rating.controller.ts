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
	 * @route   POST /api/v1/ratings
	 * @desc    Create a new rating
	 * @access  Public
	 */

	@Post()
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new rating | Client' })

	async create(@Res() res, @Body() input: PushRatingDTO, @User() user: IUser) {
		console.log('user', user)
        const user_id = user._id
		const result = await this.ratingService.store(input, user_id);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'The Rating has been successfully created.',
			data: result
		});
	}

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
}
