import { 
    Controller,
    Get,
    Post,
    Req,
    UseGuards,
    Body
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth
} from '@nestjs/swagger';

import { PaymentService } from './payment.service';
import { CreditCartDto } from './dto/payment.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
    constructor(private paymentService: PaymentService) {}

    /**
     * @route   GET api/v1/payments/add
     * @desc    Add product to payment
     * @access  Public
     */
    @Post('tokenization')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add tokenization payment' })

    async addCreditCart(@Req() req, @Body() ccDto: CreditCartDto) {
	    const user = req.user
        return await this.paymentService.tokenization(user, ccDto)
    }

    @Post('virtual_account')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Virtual account' })

    async createVN(@Req() req, @Body() ccDto: CreditCartDto) {
        const user = req.user
        console.log('ccDto:', ccDto)
		return await this.paymentService.createVN(user, ccDto)
    }
}
