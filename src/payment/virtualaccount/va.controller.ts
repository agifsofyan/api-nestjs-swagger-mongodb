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

    async createVA(@Req() req, @Body() vaDto: VaDto) {
        const user = req.user
        console.log('vaDto:', vaDto)
		return await this.vaService.createVA(user, vaDto)
    }
}
