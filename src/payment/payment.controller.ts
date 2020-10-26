import { 
    Controller,
    Get,
    Post,
    UseGuards,
    Body,
    Request
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@ApiTags('payments/pay')
@Controller('payments/pay')
export class PaymentController {
    constructor(private paService: PaymentService) {}

    /**
     * @route   Post api/v1/va/create_account
     * @desc    Payment Pay
     * @access  Public
     */
    @Post()
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Payment Pay' })

    async createVA(@Body() external_id: string, @Body() amount: number) {
        return await this.paService.simulate_payment(external_id, amount)
    }
}
