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
// import { Request } from 'express';
import { VaService } from './va.service';
import { VaDto } from './dto/va.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@ApiTags('payments/va')
@Controller('payments/va')
export class VaController {
    constructor(private vaService: VaService) {}

    /**
     * @route   GET api/v1/va/create_account
     * @desc    Create New Virtual Acoount
     * @access  Public
     */
    @Post('create_account')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create Virtual account' })

    async createVA(@Body() vaDto: VaDto, @Request() req) {
        return await this.vaService.createVA(vaDto, req)
    }

    /**
     * @route   GET api/v1/va/get_account
     * @desc    Get Virtual Acoount
     * @access  Public
     */
    @Get('get_account')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get Virtual account' })

    async getVA(@Request() req) {
        return await this.vaService.getVA(req)
    }
}
