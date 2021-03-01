import {
	Controller,
	Get,
	Param,
	Body,
	Post,
    UseGuards,
    HttpStatus,
    Req,
	Res,
	Put
} from '@nestjs/common';

import {
	ApiTags,
	ApiOperation,
    ApiBearerAuth,
    ApiQuery,
	ApiParam
} from '@nestjs/swagger';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtGuard } from '../../auth/guards/jwt.guard';

import { PaymentMethodService } from './method.service';
import { PaymentMethodDto as pmDto, UpdateMethodDto } from './dto/payment.dto';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags("Payment_Methods")
@UseGuards(RolesGuard)
@Controller('payments/method')
export class PaymentMethodController {
    constructor(private pmService: PaymentMethodService) {}

    /**
     * @route   POST api/v1/va/payments/method
     * @desc    Create payments method
     * @access  Public
     */
    @Post()
    @UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
    @ApiOperation({ summary: 'Create Payment Method | Backoffice' })

    async createVA(@Body() pmDto: pmDto, @Res() res) {
		const result = await this.pmService.insert(pmDto)
		
		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'Create new payment method is successful',
			data: result
		});
    }

    /**
     * @route   GET api/v1/va/payments/method
     * @desc    Get all payments method
     * @access  Public
     */
    @Get()
    @ApiOperation({ summary: 'Get All Payment Method | Free' })

    // Swagger Parameter [optional]
	@ApiQuery({
		name: 'sortval',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})

	@ApiQuery({
		name: 'sortby',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})

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

	@ApiQuery({
		name: 'limit',
		required: false,
		explode: true,
		type: Number,
		isArray: false
	})

	@ApiQuery({
		name: 'offset',
		required: false,
		explode: true,
		type: Number,
		isArray: false
    })
    
    async index(@Req() req, @Res() res) {
        const result = await this.pmService.getAll(req.query)
        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get payment methods`,
			total: result.length,
			data: result
		});
    }

    /**
     * @route   GET api/v1/va/payments/method/:id
     * @desc    Get payments method by ID
     * @access  Public
     */
    @Get(':id')
    @ApiOperation({ summary: 'Get Payment Method By Id | Free' })

	@ApiParam({
		name: 'id',
		required: true,
		explode: true,
		type: String,
		example: '5fb24fc4c49a9f4adc62bceb',
		description: 'ID of Payment Method'
	})

    async getById(@Param('id') id: string, @Res() res) {
        const result = await this.pmService.getById(id)
        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get payment method by Id`,
			data: result
		});
	}
	
	/**
	 * @route   Put /api/v1/payments/method/:id
	 * @desc    Update payments method by Id
	 * @access  Public
	 **/

	@Put(':id')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update payment method by id | Backoffice' })

	@ApiParam({
		name: 'id',
		required: true,
		explode: true,
		type: String,
		example: '5fb24fc4c49a9f4adc62bceb',
		description: 'ID of Payment Method'
	})

	async update(
		@Param('id') id: string,
		@Res() res,
		@Body() updateMethodDto: UpdateMethodDto
	) {
		const query = await this.pmService.updateById(id, updateMethodDto);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'The Payment Method has been successfully updated.',
			data: query
		});
	}

	/**
     * @route   GET api/v1/va/payments/method/list/count
     * @desc    Get payments method & Count
     * @access  Public
     */
	@Get('list/count')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
    @ApiOperation({ summary: 'Get Payment Method & Count | Backoffice' })

    async listCount(@Res() res) {
        const result = await this.pmService.methodListCount()
        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get payment method`,
			total: result.length,
			data: result
		});
	}
}
