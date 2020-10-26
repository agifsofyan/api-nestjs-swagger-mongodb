import { 
    Controller,
    Get,
    Post,
    UseGuards,
    Body,
    Param
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth
} from '@nestjs/swagger';
// import { Request } from 'express';
import { PaymentMethodService } from './method.service';
import { PaymentMethodDto as pmDto } from './dto/payment.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@ApiTags('payments/method')
@Controller('payments/method')
export class PaymentMethodController {
    constructor(private pmService: PaymentMethodService) {}

    /**
     * @route   GET api/v1/va/payments/method
     * @desc    Create payments method
     * @access  Public
     */
    @Post()
    @ApiOperation({ summary: 'Create Payment Method' })

    async createVA(@Body() pmDto: pmDto) {
        return await this.pmService.insert(pmDto)
    }

    /**
     * @route   GET api/v1/va/payments/method
     * @desc    Get all payments method
     * @access  Public
     */
    @Get('')
    @ApiOperation({ summary: 'Get All Payment Method' })

    async index() {
        return await this.pmService.getAll()
    }

    /**
     * @route   GET api/v1/va/payments/method/:name
     * @desc    Get payments method by name
     * @access  Public
     */
    @Get(':name')
    @ApiOperation({ summary: 'Get Payment Method By Name' })

    async getVA(@Param('name') name: string) {
        return await this.pmService.getByName(name)
    }
}
