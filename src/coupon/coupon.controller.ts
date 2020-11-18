import { 
    Controller,
    Get,
    Param,
    UseGuards,
    Req,
    Res,
    HttpStatus
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiQuery
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CouponService } from './coupon.service';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponController {
    constructor(private couponService: CouponService) {}

	/**
	 * @route   GET /api/v1/Coupons
	 * @desc    Get all Coupon
	 * @access  Public
	 */

	@Get()
	// @UseGuards(JwtAuthGuard)
	// @Roles(...inRole)
	// @ApiBearerAuth()
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
	// @UseGuards(JwtAuthGuard)
	// @Roles(...inRole)
	// @ApiBearerAuth()
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
	 * @route   GET /api/v1/coupons/code/:code
	 * @desc    Get coupon by Code
	 * @access  Public
	 */

	@Get('code/:code')
	@ApiBearerAuth()
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
