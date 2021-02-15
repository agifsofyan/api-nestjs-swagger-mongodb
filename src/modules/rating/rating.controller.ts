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
import { RatingService } from './rating.service';
import { IUser } from '../user/interfaces/user.interface';
import { User } from '../user/user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RatingField } from './dto/rating.dto';

const backoffice = ["ADMIN", "SUPERADMIN", "IT", "SALES"];
const client = ["USER"]
const all = backoffice.concat(client);

@ApiTags("Ratings_C")
@UseGuards(RolesGuard)
@Controller('ratings')
export class RatingController {
    constructor(private readonly ratingService: RatingService) { }

	@Get()
	@UseGuards(JwtGuard)
	@Roles(...all)
	@ApiBearerAuth()
    @ApiOperation({ summary: 'Get all rating | Client' })
    
    // Swagger Parameter [optional]
	@ApiQuery({
		name: 'average',
		required: false,
		explode: false,
		type: Boolean,
		isArray: false,
		// enum: AverageCondition
	})

	@ApiQuery({
		name: 'field',
		required: false,
		explode: false,
		type: String,
		isArray: false,
		enum: RatingField
	})

    async byUID(
        @Query('field') field: string,
        @Query('average') average: boolean,
        @Res() res
    ) {
		const result = await this.ratingService.countRate(field, average);

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
            message: 'The Rating has been successfully render.',
			data: result
		});
    }

	/**
	 * @route    Get /api/v1/products/rating/add
	 * @desc     Add rating
	 * @access   Public
	 */

	@Post('add')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Add rating' })

	@ApiQuery({
		name: 'field',
		required: false,
		explode: false,
		type: String,
		isArray: false,
		enum: RatingField,
		example: "product"
	})

	@ApiQuery({
		name: 'id',
		required: false,
		explode: false,
		type: String,
		isArray: false,
		example: "6022405e948c8e001c35f633"
	})

	@ApiQuery({
		name: 'rate',
		required: false,
		explode: false,
		type: Number,
		isArray: false,
		example: 2,
	})

	async addRating(
		@Res() res,
		@User() user: IUser,
		@Query('field') field: string,
		@Query('id') id: string,
		@Query('rate') rate: number
	)  {
		const query = {
			user_id: user._id,
			field,
			id,
			rate
		}
		const result = await this.ratingService.addRating(query);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: result
		});
	}
}
