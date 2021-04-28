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
	Query,
	BadRequestException
} from '@nestjs/common';

import {
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
} from '@nestjs/swagger';

import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';

import { GeneralSettingsService } from './general-settings.service';
import { SetGeneralDto } from './dto/set-general.dto';
import { SetPrivacyPoliceDto, SetTermConditionDto, SetFaqDto } from './dto/set-general-settings.dto';
import { SetHomeSectionDto } from './dto/set-home-section.dto';
import { SetOnContentDto, SetOnHeaderDto, SetOnPageDto } from './dto/set-hot-sales.dto';
import { SetImgModuleDto } from './dto/set-lms-module.dto';

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
	@ApiOperation({ summary: 'Set General Setting | Backoffice' })

	async setGeneral(@Res() res, @Body() GeneralSeting: SetGeneralDto) {
		const result = await this.generalService.setAnything(GeneralSeting);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'success set generat setting',
			data: result
		});
	}

	/**
	* @route   GET /api/v1/general-setting
	* @desc    Get General Setting
	* @access  Public
	*/

	@Get()
	@ApiOperation({ summary: 'Get General Setting | Free' })

	async getGeneral(@Res() res) {
		const result = await this.generalService.getAnything();

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'success get general setting',
			data: result
		});
	}

	/**
	* @route   GET /api/v1/general-setting/privacy-police
	* @desc    Get General Setting - Privacy Police
	* @access  Public
	*/

	@Get('privacy-police')
	@ApiOperation({ summary: 'Get Privacy Policy | Free' })

	async getPrivacyPolice(@Res() res) {
		const result = await this.generalService.getAnything('privacy_policy');

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'success get privacy policy',
			data: result
		});
	}

	/**
	* @route   GET /api/v1/general-setting/term-condition
	* @desc    Get General Setting - Term & Condition
	* @access  Public
	*/

	@Get('term-condition')
	@ApiOperation({ summary: 'Get Term & Condition | Free' })

	async getTermCondition(@Res() res) {
		const result = await this.generalService.getAnything('term_condition');

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'success get term & condition',
			data: result
		});
	}

	/**
	* @route   GET /api/v1/general-setting/faq
	* @desc    Get General Setting - FAQ
	* @access  Public
	*/

	@Get('faq')
	@ApiOperation({ summary: 'Get FAQ | Free' })

	async getFaq(@Res() res)  {
		const result = await this.generalService.getAnything('faq');

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'success get faq',
			data: result
		});
	}

	// Set
	/**
	* @route   POST /api/v1/general-setting/privacy-police
	* @desc    Set General Setting - Privacy Police
	* @access  Public
	*/

	@Post('privacy-police')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Set Privacy Police | Backoffice' })

	async setPrivacyPolice(@Res() res, @Body() privacyPolice: SetPrivacyPoliceDto) {
		const result = await this.generalService.setAnything(privacyPolice, 'privacy_policy');

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'success set privacy policy',
			data: result
		});
	}

	/**
	* @route   POST /api/v1/general-setting/term-condition
	* @desc    Set General Setting - Term & Condition
	* @access  Public
	*/

	@Post('term-condition')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Set Term & Condition | Backoffice' })

	async setTermCondition(@Res() res, @Body() termCondition: SetTermConditionDto) {
		const result = await this.generalService.setAnything(termCondition, 'term_condition');

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'success set term & condition',
			data: result
		});
	}

	/**
	* @route   POST /api/v1/general-setting/faq
	* @desc    Set General Setting - FAQ
	* @access  Public
	*/

	@Post('faq')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Set FAQ | Backoffice' })

	async setFaq(@Res() res, @Body() setFaq: SetFaqDto) {
		const result = await this.generalService.setAnything(setFaq, 'faq');

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'success set faq',
			data: result
		});
	}

	/**
	* @route   POST /api/v1/general-setting/home-page
	* @desc    Set General Setting - Home Page Section
	* @access  Public
	*/

	@Post('home-page')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Set Section in Home Page | Backoffice' })

	async setHomePage(@Res() res, @Body() input: SetHomeSectionDto) {
		var body:any = { home_page: input }
		body.home_page.product = input.product_id
		delete body.home_page.product_id

		const result = await this.generalService.setAnything(body, 'home_page');

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'success set home-page section',
			data: result
		});
	}

	/**
	* @route   Get /api/v1/general-setting/home-page
	* @desc    get General Setting - Home Page Section
	* @access  Public
	*/

	@Get('home-page')
	@ApiOperation({ summary: 'Get Section in Home Page | Free' })

	async getHomePage(@Res() res)  {
		const result = await this.generalService.getAnything('home_page');

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'success get home-page section',
			data: result
		});
	}

	/**
	* @route   POST /api/v1/general-setting/on-header
	* @desc    Set General Setting - Hot Sales, On Header
	* @access  Public
	*/

	@Post('on-header')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Set Hot Sales, On Header | Backoffice' })

	async setOnHeader(@Res() res, @Body() input: SetOnHeaderDto) {
		const result = await this.generalService.setAnything({on_header: input}, 'on_header');

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'success set hot-sales on-header',
			data: result
		});
	}

	/**
	* @route   Get /api/v1/general-setting/home-page
	* @desc    get General Setting - Hot Sales, On Header
	* @access  Public
	*/

	@Get('on-header')
	@ApiOperation({ summary: 'Get Hot Sales, On Header | Free' })

	async getOnHeader(@Res() res)  {
		const result = await this.generalService.getAnything('on_header');

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'success get hot-sales on-header',
			data: result
		});
	}

	/**
	* @route   POST /api/v1/general-setting/on-page
	* @desc    Set General Setting - Hot Sales, On Page
	* @access  Public
	*/

	@Post('on-page')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Set Hot Sales, On Page | Backoffice' })

	async setOnPage(@Res() res, @Body() input: SetOnPageDto) {
		const result = await this.generalService.setAnything(input, 'on_page');

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'success set hot-sales on-page',
			data: result
		});
	}

	/**
	* @route   Get /api/v1/general-setting/on-page
	* @desc    get General Setting - Hot Sales, On Page
	* @access  Public
	*/

	@Get('on-page')
	@ApiOperation({ summary: 'Get Hot Sales, On Page | Free' })

	async getOnPage(@Res() res) {
		const result = await this.generalService.getAnything('on_page');

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'success get hot-sales on-page',
			data: result
		});
	}

	/**
	* @route   POST /api/v1/general-setting/on-content
	* @desc    Set General Setting - Hot Sales, On Content
	* @access  Public
	*/

	@Post('on-content')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Set Hot Sales, On Content | Backoffice' })

	async setOnContent(@Res() res, @Body() input: SetOnContentDto) {
		input.on_content.map(res => {
			if(res.type !== 'fulfillment' && res.type !== 'blog'){
				throw new BadRequestException('type value is: fulfilment, blog')
			}
		})

		const result = await this.generalService.setAnything(input, 'on_content');

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'success set hot-sales on-content',
			data: result
		});
	}

	/**
	* @route   Get /api/v1/general-setting/on-content
	* @desc    get General Setting - Hot Sales, On Page
	* @access  Public
	*/

	@Get('on-content')
	@ApiOperation({ summary: 'Get Hot Sales, On Content | Free' })

	async getOnContent(@Res() res)  {
		const result = await this.generalService.getAnything('on_content');

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'success get hot-sales on-content',
			data: result
		});
	}

	/**
	* @route   POST /api/v1/general-setting/image-module
	* @desc    Set General Setting - in LMS module
	* @access  Public
	*/

	@Post('image-module')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Set image in LMS module | Backoffice' })

	async setImgModule(@Res() res, @Body() input: SetImgModuleDto) {
		const result = await this.generalService.setAnything(input, 'image_module');

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'success set image in LMS module',
			data: result
		});
	}
}
