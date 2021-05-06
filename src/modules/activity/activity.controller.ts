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
import { ActivityService } from './activity.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';
import { CLassType } from './dto/activity.dto';

var inRole = ["USER"];

// @ApiTags("Activity")
@UseGuards(RolesGuard)
@Controller('activity')
export class ActivityController {
    constructor(
        private readonly ActivityService: ActivityService,
    ) { }

    /**
	 * @route   Send /api/v1/activity/progress/:type/:id
	 * @desc    Send Progress
	 * @access  Public
	 */
	@Post()
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get Dashboard | Client' })

	@ApiParam({
		name: 'type',
		required: true,
		explode: true,
        enum: CLassType,
		type: String,
		description: 'Type Field, available in: content, product, video'
	})

    @ApiParam({
		name: 'id',
		required: true,
		explode: true,
        example: '6077f5130c8459001c67b810',
		type: String,
		description: 'ID of product / content / video'
	})

	async findAll(
		@Res() res,
        @Param('type') type: string,
        @Param('id') id: string,
        @User() user: IUser
	) {
		const result = await this.ActivityService.actProgress(user, type, id);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get LMS`,
			data: result
		});
	}
}
