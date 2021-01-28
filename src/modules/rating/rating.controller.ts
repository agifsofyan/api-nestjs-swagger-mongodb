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
		explode: true,
		type: Boolean,
		isArray: false
	})

	@ApiQuery({
		name: 'count',
		required: false,
		explode: true,
		type: Boolean,
		isArray: false
	})

    async byUID(
        @Query('average') average: boolean,
        @Query('count') count: boolean,
        @Res() res
    ) {
		const result = await this.ratingService.countRate(average, count);

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
            message: 'The Rating has been successfully render.',
			data: result
		});
    }
}
