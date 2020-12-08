import {
	Controller,
	Res,
	HttpStatus,
	Body,
	Post,
	UseGuards,
	Get,
	Param,
	Put,
	Delete,
	Query,
	Req
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
import { MailService } from './mail.service';
import { 
	SendMailDTO, 
	MailTemplateDTO,
	UpdateTemplateDTO 
} from './dto/mail.dto';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags("Mails_B")
@UseGuards(RolesGuard)
@Controller('mails/mailgun')
export class MailController {
    constructor(private readonly mailService: MailService) { }

    /**
	 * @route   POST /api/v1/mails/mailgun
	 * @desc    Send Email - Mailgun
	 * @access  Public
	 */

	@Post()
	// @UseGuards(JwtGuard)
	// @Roles(...inRole)
	// @ApiBearerAuth()
	@ApiOperation({ summary: 'Send email - Mailgun | Backofffice' })

	async sendMail(@Res() res, @Body() format: SendMailDTO) {
		const result = await this.mailService.sendMail(format)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Email sent successfully',
			data: result
		});
	}

	/**
	 * @route   POST /api/v1/mails/mailgun/templates
	 * @desc    Create Email Template - Mailgun
	 * @access  Public
	 */

	@Post('templates')
	// @UseGuards(JwtGuard)
	// @Roles(...inRole)
	// @ApiBearerAuth()
	@ApiOperation({ summary: 'Create email template - Mailgun | Backofffice' })

	async createTemplate(
		@Res() res,
		@Req() req, 
		@Body() template: MailTemplateDTO
	) {
		const result = await this.mailService.createTemplate(req.user._id, template)

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'Template created successfully',
			data: result
		});
	}

	/**
	 * @route   Get /api/v1/mails/mailgun/template
	 * @desc    Get Email Templates - Mailgun
	 * @access  Public
	 */

	@Get('templates')
	// @UseGuards(JwtGuard)
	// @Roles(...inRole)
	// @ApiBearerAuth()
	@ApiOperation({ summary: 'Get all email template - Mailgun | Backofffice' })

	@ApiQuery({
		name: 'limit',
		required: false,
		explode: true,
		type: Number,
		isArray: false
	})

	async getTemplates(@Res() res, @Query('limit') limit: number) {
		const result = await this.mailService.getTemplates(limit)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Get all Template successfully',
			total: result.items.length,
			data: result
		});
	}

	/**
	 * @route   Get /api/v1/mails/mailgun/template/:template_name
	 * @desc    Get Email Template - Mailgun
	 * @access  Public
	 */

	@Get('templates/:template_name')
	// @UseGuards(JwtGuard)
	// @Roles(...inRole)
	// @ApiBearerAuth()
	@ApiOperation({ summary: 'Get email template - Mailgun | Backofffice' })

	async getTemplate(@Res() res, @Param('template_name') param: string) {
		const result = await this.mailService.getTemplate(param)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Get Template successfully',
			data: result
		});
	}

	/**
	 * @route   Put /api/v1/mails/mailgun/template/:template_name
	 * @desc    Put Email Template - Mailgun
	 * @access  Public
	 */

	@Put('templates/:template_name')
	// @UseGuards(JwtGuard)
	// @Roles(...inRole)
	// @ApiBearerAuth()
	@ApiOperation({ summary: 'Update email template - Mailgun | Backofffice' })

	async updateTemplate(
		@Res() res,
		@Req() req, 
		@Param('template_name') template_name: string, 
		@Body() description: UpdateTemplateDTO
	) {
		const result = await this.mailService.updateTemplate(req.user._id, template_name, description)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Update Template successfully'
			// data: result
		});
	}

	/**
	 * @route   Delete /api/v1/mails/mailgun/template/:template_name
	 * @desc    Delete Email Template - Mailgun
	 * @access  Public
	 */

	@Delete('templates/:template_name')
	// @UseGuards(JwtGuard)
	// @Roles(...inRole)
	// @ApiBearerAuth()
	@ApiOperation({ summary: 'Delete email template - Mailgun | Backofffice' })

	async dropTemplate(@Res() res, @Param('template_name') template_name: string) {
		const result = await this.mailService.dropTemplate(template_name)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Delete Template successfully'
		});
	}
}
