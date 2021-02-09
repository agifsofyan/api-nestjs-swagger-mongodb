import {
	Controller,
	Body,
	Post,
    Res,
    HttpStatus,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation
} from '@nestjs/swagger';
import { UsercontainService } from './usercontain.service';
import { LandingForm } from './dto/usercontain.dto';

@ApiTags("landing_page")
@Controller('usercontains')
export class UsercontainController {
    constructor(private readonly ucService: UsercontainService) { }

	/**
	 * @route   POST /api/v1/usercontains
	 * @desc    Create a new usercontain
	 * @access  Public
	 */
	@Post()
	@ApiOperation({ summary: 'Landing Page Form | Free' })

	async create(@Res() res, @Body() input: LandingForm) {
		const result = await this.ucService.insert(input);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'Successfully sent data.',
			data: result
		});
	}
}
