import { 
    Controller,
    Get,
    Param,
    UseGuards,
    Req,
    Res,
    HttpStatus,
    NotImplementedException,
    HttpService
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiQuery
} from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { PaymentMethodService } from './method.service';

@ApiTags('payments-method')
@Controller('payments/method')
export class PaymentMethodController {
    constructor(private pmService: PaymentMethodService) {}

    /**
     * @route   GET api/v1/va/payments/method
     * @desc    Get all payments method
     * @access  Public
     */

    @Get()
	@UseGuards(JwtGuard)
    @ApiBearerAuth()
	@ApiOperation({ summary: 'Get payment methods' })

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

	async findAll(@Req() req, @Res() res) {
		const query = await this.pmService.getAll(req.query)
		return res.status(HttpStatus.OK).json(query)

    }

    /**
     * @route   GET api/v1/va/payments/method/:name
     * @desc    Get payments method by name
     * @access  Public
     */
    @Get(':id')
    @ApiOperation({ summary: 'Get Payment Method By Id' })

    async getVA(@Param('id') id: string, @Res() res) {
		const query = await this.pmService.getById(id)
		return res.status(HttpStatus.OK).json(query);
    }
}
