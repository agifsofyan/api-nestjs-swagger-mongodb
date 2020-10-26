import { 
    Controller,
    Get,
    Post,
    UseGuards,
    Body,
    Request,
    Param
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth
} from '@nestjs/swagger';
// import { Request } from 'express';
import { PaymentAccountService } from './account.service';
import { PaymentAccountDto } from './dto/account.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@ApiTags('payments/account')
@Controller('payments')
export class PaymentAccountController {
    constructor(private paService: PaymentAccountService) {}

    /**
     * @route   GET api/v1/va/payments/acount
     * @desc    Create New Virtual Acoount
     * @access  Public
     */
    @Post('account/va')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create Payment Account' })

    async createVA(@Body() paDto: PaymentAccountDto, @Request() req) {
        return await this.paService.createVA(paDto, req)
    }

    /**
     * @route   GET api/v1/va/payments/acount/va/:payment_method_id
     * @desc    Get Virtual Account
     * @access  Public
     */
    @Get('account/va/:payment_method_id')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get Virtual account' })

    async getVA(@Param('payment_method_id') payment_method_id: string, @Request() req) {
        return await this.paService.getVA(payment_method_id, req)
    }

    /**
     * @route   GET api/v1/ro/payments/acount
     * @desc    Create New Retail Outlet
     * @access  Public
     */
    @Post('account/ro')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create Retail Outlet' })

    async createRO(@Body() paDto: PaymentAccountDto, @Request() req) {
        return await this.paService.createRO(paDto, req)
    }

    /**
     * @route   GET api/v1/ro/payments/acount/va/:payment_method_id
     * @desc    Get Virtual Acoount
     * @access  Public
     */
    @Get('account/ro/:payment_method_id')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get  Retail Outlet' })

    async getRO(@Param('payment_method_id') payment_method_id: string, @Request() req) {
        return await this.paService.getRO(payment_method_id, req)
    }
}
