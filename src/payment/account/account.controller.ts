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
import { PayRO_Dto, PayVA_Dto, PayEW_Dto, PayCC_Dto } from './dto/account.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@ApiTags('payments-account')
@Controller('payments/account')
export class PaymentAccountController {
    constructor(private paService: PaymentAccountService) {}

    /**
     * @route   GET api/v1/payments/account/va
     * @desc    Create New Virtual Acoount
     * @access  Public
     */
    @Post('va')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create Payment Account' })

    async createVA(@Body() paDto: PayVA_Dto, @Request() req) {
        return await this.paService.createVA(paDto, req.user.userId)
    }

    /**
     * @route   GET api/v1/payments/account/va/:payment_method_id
     * @desc    Get Virtual Account
     * @access  Public
     */
    @Get('va/:payment_method_id')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get Virtual account' })

    async getVA(@Param('payment_method_id') payment_method_id: string, @Request() req) {
        return await this.paService.getVA(payment_method_id, req.user.userId)
    }

    /**
     * @route   GET api/v1/payments/account/ro
     * @desc    Create New Retail Outlet
     * @access  Public
     */
    @Post('ro')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create Retail Outlet' })

    async createRO(@Body() paDto: PayRO_Dto, @Request() req) {
        // console.log('paDto:', paDto)
        return await this.paService.createRO(paDto, req.user.userId)
    }

    /**
     * @route   GET api/v1/payments/account/ro/:payment_method_id
     * @desc    Get Virtual Acoount
     * @access  Public
     */
    @Get('ro/:payment_method_id')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get  Retail Outlet' })

    async getRO(@Param('payment_method_id') payment_method_id: string, @Request() req) {
        return await this.paService.getRO(payment_method_id, req.user.userId)
    }

    /**
     * @route   GET api/v1/payments/account/ewallet
     * @desc    Create New Retail Outlet
     * @access  Public
     */
    @Post('ewallet')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create EWallet' })

    async createEW(@Body() paDto: PayEW_Dto, @Request() req) {
        return await this.paService.createEW(paDto, req.user.userId)
    }

    /**
     * @route   GET api/v1/payments/account/ewallet/:payment_method_id
     * @desc    Get EWallet
     * @access  Public
     */
    @Get('ewallet/:payment_method_id')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get EWallet' })

    async getEW(@Param('payment_method_id') payment_method_id: string, @Request() req) {
        return await this.paService.getEW(payment_method_id, req.user.userId)
    }
}
