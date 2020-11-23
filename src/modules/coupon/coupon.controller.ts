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
	ApiQuery
} from '@nestjs/swagger';

import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CouponService } from './coupon.service';
import {
	CreateCouponDTO,
	UpdateCouponDTO,
	ArrayIdDTO,
	SearchDTO
} from './dto/coupon.dto';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags('Coupons - [SUPERADMIN & ADMIN]')
@UseGuards(RolesGuard)
@Controller('coupons')
export class CouponController {
	constructor(private readonly couponService: CouponService) { }

	/**
	 * @route   POST /api/v1/Coupons
	 * @desc    Create a new Coupon
	 * @access  Public
	 */

	@Post()
	@UseGuards(JwtAuthGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new Coupon' })

	async create(@Res() res, @Body() createCouponDto: CreateCouponDTO) {
		const Coupon = await this.couponService.create(createCouponDto);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'The Coupon has been successfully created.',
			data: Coupon
		});
	}

	/**
	 * @route   GET /api/v1/Coupons
	 * @desc    Get all Coupon
	 * @access  Public
	 */

	@Get()
	@ApiOperation({ summary: 'Get all Coupon' })

	// Swagger Parameter [optional]
	@ApiQuery({
		name: 'value',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})

	@ApiQuery({
		name: 'fields',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})

	async findAll(@Req() req, @Res() res) {
		const Coupon = await this.couponService.findAll(req.query);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get Coupons`,
			total: Coupon.length,
			data: Coupon
		});
	}

	/**
	 * @route    Get /api/v1/Coupons/:id
	 * @desc     Get Coupon by ID
	 * @access   Public
	 */

	@Get(':id')
	@ApiOperation({ summary: 'Get Coupon by id' })

	async findById(@Param('id') id: string, @Res() res)  {
		const Coupon = await this.couponService.findById(id);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get Coupon by id ${id}`,
			data: Coupon
		});
	}

	/**
	 * @route   Put /api/v1/Coupons/:id
	 * @desc    Update Coupon by Id
	 * @access  Public
	 **/

	@Put(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update Coupon by id' })

	async update(
		@Param('id') id: string,
		@Res() res,
		@Body() updateCouponDto: UpdateCouponDTO
	) {
		const Coupon = await this.couponService.updateById(id, updateCouponDto);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'The Coupon has been successfully updated.',
			data: Coupon
		});
	}

	/**
	 * @route   Delete /api/v1/Coupons/:id
	 * @desc    Delete Coupon by ID
	 * @access  Public
	 **/

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete Coupon' })

	async delete(@Param('id') id: string, @Res() res){
		const Coupon = await this.couponService.delete(id);

		if (Coupon == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success remove Coupon by id ${id}`
			});
		}
	}

	/**
	 * @route   Delete /api/v1/Coupons/delete/multiple
	 * @desc    Delete Coupon by multiple ID
	 * @access  Public
	 **/

	@Delete('delete/multiple')
	@UseGuards(JwtAuthGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete multiple Coupon' })

	async deleteMany(@Res() res, @Body() arrayId: ArrayIdDTO) {
		const Coupon = await this.couponService.deleteMany(arrayId.id);
		if (Coupon == 'ok') {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success remove Coupon by id in: [${arrayId.id}]`
			});
		}
	}

	/**
	 * @route   Post /api/v1/Coupons/find/search
	 * @desc    Search Coupon by name
	 * @access  Public
	 **/

	/**
	@Post('find/search')
	@UseGuards(JwtAuthGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Search and show' })

	async search(@Res() res, @Body() search: SearchDTO) {
		const result = await this.couponService.search(search);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success search Coupon`,
			total: result.length,
			data: result
		});
	}
	*/

	/**
	 * @route   POST /api/v1/coupons/multiple/clone
	 * @desc    Clone coupons
	 * @access  Public
	 */

	@Post('multiple/clone')
	@UseGuards(JwtAuthGuard)
	@Roles(...inRole)
	@ApiBearerAuth()

	@ApiOperation({ summary: 'Clone coupons' })

	async clone(@Res() res, @Body() input: ArrayIdDTO) {

		const cloning = await this.couponService.insertMany(input)

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'Has been successfully cloned the coupon.',
			data: cloning
		});
	}

	/**
	 * @route   GET /api/v1/coupons/code/:code
	 * @desc    Get coupon by Code
	 * @access  Public
	 */

	@Get('code/:code')
	@ApiOperation({ summary: 'Get coupon by Code' })

	async findByCode(@Res() res, @Param('code') code: string) {
		const query = await this.couponService.findByCode(code)
		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'Success get coupons',
			data: query
		});
	}
}
