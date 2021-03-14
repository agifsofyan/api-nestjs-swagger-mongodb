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

import { GeneralSettingsService } from './general-settings.service';
import { GeneralSetingDto } from './dto/general-seetings.dto';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags("General-settings")
@UseGuards(RolesGuard)
@Controller('general-settings')
export class GeneralSettingsController {
    constructor(private readonly generalService: GeneralSettingsService) { }

    /**
	 * @route   POST /api/v1/general-setting
	 * @desc    Create a new General Setting
	 * @access  Public
	 */

	@Post()
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new General Setting | Backoffice' })

	async create(@Res() res, @Body() GeneralSeting: GeneralSetingDto) {
		const Coupon = await this.generalService.create(GeneralSeting);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'The General Setting has been successfully created.',
			data: Coupon
		});
	}
}
