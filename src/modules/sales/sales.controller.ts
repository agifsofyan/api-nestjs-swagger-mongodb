import {
	Controller,
	Get,
	Res,
	HttpStatus,
	Req,
	Param,
	Body,
	Post,
    Query,
	UseGuards
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
	ApiQuery,
	ApiBody,
	ApiProperty,
	ApiParam
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtGuard } from '../auth/guards/jwt.guard';
// import { SalesService } from './services/sales.service';
import { UtmStatusValue, UtmSettingDTO } from './dto/utm-setting.dto';
import { UTMService } from './services/utm.service';

var inRole = ["SUPERADMIN", "IT", "ADMIN", "SALES"];

@ApiTags("Sales")
@UseGuards(RolesGuard)
@Controller('sales')
export class SalesController {
    constructor(
        // private readonly salesService: SalesService,
        private readonly utmService: UTMService,
    ) { }

    /**
	 * @route   POST /api/v1/sales/utm
	 * @desc    Create a new utm sales
	 * @access  Public
	 */
	@Post('utm')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new UTM | Backofffice [sales, admin]' })

	async addUTM(@Res() res, @Body() input: UtmSettingDTO) {
		const result = await this.utmService.addUTM(input);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'The UTM has been successfully created.',
			data: result
		});
	}

    /**
	 * @route   Get /api/v1/sales/utm
	 * @desc    Get list of utm sales
	 * @access  Public
	 */
	@Get('utm')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new UTM | Backofffice [sales, admin]' })

    @ApiQuery({
		name: 'status',
		required: false,
		explode: true,
        type: String,
		enum: UtmStatusValue,
		isArray: false
	})

	async listOfUTM(@Res() res, @Query('status') status: string) {
		const result = await this.utmService.listOfUTM(status);

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Get UTM list.',
            total: result.length,
			data: result
		});
	}
}
