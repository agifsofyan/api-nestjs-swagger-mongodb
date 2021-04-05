import {
	Controller,
	Res,
	HttpStatus,
	Body,
	Post,
	UseGuards
} from '@nestjs/common';

import {
	ApiTags,
	ApiOperation,
	ApiBearerAuth
} from '@nestjs/swagger';

import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { MailService } from './mail.service';
import { SendMailDTO } from './dto/mail.dto';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags("Mails")
@UseGuards(RolesGuard)
@Controller('mails')
export class MailController {
    constructor(
		private readonly mailService: MailService
	) { }

    /**
	 * @route   POST /api/v1/mails/mailgun
	 * @desc    Send Email - Mailgun
	 * @access  Public
	 */

	@Post()
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Send email - Mailgun | Backofffice' })

	async sendMail(@Res() res, @Body() format: SendMailDTO) {
		const result = await this.mailService.sendMail(format)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: result
		});
	}
}
