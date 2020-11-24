import { 
    Controller,
    Get,
    Post,
    Delete,
    Query,
    Req,
    UseGuards,
    Body
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth
} from '@nestjs/swagger';

import { LoggerService } from './logger.service';

// @ApiTags("Backoffice#Loggers")
@Controller('loggers')
export class LoggerController {
    constructor(private logService: LoggerService) {}

    /**
     * @route   GET api/v1/loggers
     * @desc    Add new logger
     * @access  Public
     */
    @Post()
    @ApiOperation({ summary: 'Add new logger' })
   
    async addToCart(@Body() input) {
        return await this.logService.store(input)
    }

    /**
     * @route   GET api/v1/loggers
     * @desc    Get loggers
     * @access  Public
     */
    @Get()
    @ApiOperation({ summary: 'Get loggers' })

    async getFromCart() {
	    return await this.logService.findAll()
    }
}

