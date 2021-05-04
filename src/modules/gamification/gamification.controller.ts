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

import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';

import { GamificationService } from './gamification.service';
import { GamificationDTO } from './dto/gamification.dto';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

// @ApiTags("Gamifications")
@UseGuards(RolesGuard)
@Controller('gamifications')
export class GamificationController {
    constructor(private readonly gamificationService: GamificationService) { }

    /**
	 * @route   POST /api/v1/gamifications
	 * @desc    Create a new gamifications
	 * @access  Public
	 */

	@Post()
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new gamifications | Backofffice' })

	async create(@Res() res, @Body() input: GamificationDTO) {
		const topic = await this.gamificationService.create(input);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'The gamifications has been successfully created.',
			data: topic
		});
	}
}
