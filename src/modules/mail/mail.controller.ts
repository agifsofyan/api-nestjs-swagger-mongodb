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
	UpdateTemplateDTO,
	newVersionDTO,
	updateVersionDTO
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
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Send email - Mailgun | Backofffice' })

	async sendMail(@Res() res, @Body() format: SendMailDTO) {
		const result = await this.mailService.sendMail(format)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: result.message,
			data: result
		});
	}

	/**
	 * @route   POST /api/v1/mails/mailgun/templates
	 * @desc    Create Email Template - Mailgun
	 * @access  Public
	 */

	@Post('templates')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create email template - Mailgun | Backofffice' })

	async createTemplate(
		@Res() res,
		@Req() req, 
		@Body() input: MailTemplateDTO
	) {
		input.by = req.user._id
		const result = await this.mailService.createTemplate(input)

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: result.message,
			data: result
		});
	}

	/**
	 * @route   Get /api/v1/mails/mailgun/templates
	 * @desc    Get Email Templates - Mailgun
	 * @access  Public
	 */

	@Get('templates')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
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
			message: result.message,
			total: result.items.length,
			data: result
		});
	}

	/**
	 * @route   Get /api/v1/mails/mailgun/templates/:template_name
	 * @desc    Get Email Template - Mailgun
	 * @access  Public
	 */

	@Get('templates/:template_name')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get email template - Mailgun | Backofffice' })

	async getTemplate(@Res() res, @Param('template_name') param: string) {
		const result = await this.mailService.getTemplate(param)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: result.message,
			data: result
		});
	}

	/**
	 * @route   Put /api/v1/mails/mailgun/templates/:template_name
	 * @desc    Put Email Template - Mailgun
	 * @access  Public
	 */

	@Put('templates/:template_name')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update email template - Mailgun | Backofffice' })

	async updateTemplate(
		@Res() res,
		@Req() req, 
		@Param('template_name') template_name: string, 
		@Body() input: UpdateTemplateDTO
	) {
		input.by = req.user._id
		const result = await this.mailService.updateTemplate(template_name, input)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: result.message
			// data: result
		});
	}

	/**
	 * @route   Delete /api/v1/mails/mailgun/template/:template_name
	 * @desc    Delete Email Template - Mailgun
	 * @access  Public
	 */

	@Delete('templates/:template_name')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete email template - Mailgun | Backofffice' })

	async dropTemplate(@Res() res, @Param('template_name') template_name: string) {
		const result = await this.mailService.dropTemplate(template_name)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: result.message
		});
	}

	/**
	 * @route   Get /api/v1/mails/mailgun/template/:template_name/versions
	 * @desc    Get Email Template - Mailgun
	 * @access  Public
	 */

	@Get('templates/:template_name/versions')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get email templates version - Mailgun | Backofffice' })

	async getTemplatesVersion(@Res() res, @Param('template_name') template_name: string) {
		const result = await this.mailService.getTemplatesVersion(template_name)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: result.message,
			total: result.length,
			data: result
		});
	}

	/**
	 * @route   Post /api/v1/mails/mailgun/templates/:template_name/versions
	 * @desc    Create Email Template Version - Mailgun
	 * @access  Public
	 */

	@Post('templates/:template_name/versions')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new version of email templates - Mailgun | Backofffice' })

	async newTemplatesVersion(
		@Res() res,
		@Body() input: newVersionDTO, 
		@Param('template_name') template_name: string
	) {
		const result = await this.mailService.newTemplatesVersion(template_name, input)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: result.message,
			data: result
		});
	}

	/**
	 * @route   Put /api/v1/mails/mailgun/templates/:template_name/versions/version_tag
	 * @desc    Update Email Template Version - Mailgun
	 * @access  Public
	 */

	@Put('templates/:template_name/versions/:version_tag')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update version of email templates - Mailgun | Backofffice' })

	async updateTemplatesVersion(
		@Res() res,
		@Body() input: updateVersionDTO, 
		@Param('template_name') template_name: string,
		@Param('version_tag') version_tag: string,
	) {
		const result = await this.mailService.updateTemplatesVersion(template_name, version_tag, input)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			// message: result.message,
			message: 'Update template version successfull',
			data: result
		});
	}

	/**
	 * @route   Delete /api/v1/mails/mailgun/templates/:template_name/versions/version_tag
	 * @desc    Remove Email Template Version - Mailgun
	 * @access  Public
	 */

	@Delete('templates/:template_name/versions/:version_tag')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete version of email templates - Mailgun | Backofffice' })

	async dropTemplatesVersion(
		@Res() res,
		@Param('template_name') template_name: string,
		@Param('version_tag') version_tag: string,
	) {
		const result = await this.mailService.dropTemplatesVersion(template_name, version_tag)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: result.message,
			data: result.template
		});
	}
}
