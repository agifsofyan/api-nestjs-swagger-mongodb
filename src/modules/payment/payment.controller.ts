import { 
    Controller, 
    Post,
    UseGuards,
    Get,
    Put,
    Param,
    Body,
    Query,
    Delete,
    Res,
    HttpStatus,
    Req
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaymentService } from './payment.service';
import { PaymentConfirmDTO } from './payment-confirm.dto';

@ApiTags('Pay-Ments')
@UseGuards(RolesGuard)
@Controller('pay-ments')
export class PaymentController {
    constructor(private paymentService: PaymentService) {}
    
    /**
     * @route   POST api/v1/payments/confirm
     * @desc    Confirm the order status
     * @access  Public
     */
    @Post('confirm')
    @UseGuards(JwtGuard)
    @Roles("USER")
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Confirm the order status | Client' })

    async confirm(@User() user: IUser, @Body() input: PaymentConfirmDTO, @Res() res) {
        input.user_id = user._id
        const result = await this.paymentService.callback(input)
        
        return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'Success confirm the payment',
			data: result
		});
    }
}
