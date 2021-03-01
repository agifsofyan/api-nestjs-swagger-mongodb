import { 
    Controller,
    Post,
    Put,
    Get,
    Body,
    UseGuards,
    Res,
    Req,
    HttpStatus,
    Query,
    Param
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiQuery,
    ApiParam
} from '@nestjs/swagger';

import { TransferConfirmDTO, bankAvailable } from './dto/banktransfer-form.dto';
import { BanktransferService } from './banktransfer.service';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

var inRole = ["ADMIN", "IT", "SALES", "SUPERADMIN"];

@ApiTags("Transfer_Confirm")
@UseGuards(RolesGuard)
@Controller('transfer_confirms')
export class BanktransferController {
    constructor(private transferService: BanktransferService) {}

    /**
     * @route   POST api/v1/transfer_confirms
     * @desc    Create a new transfer confirmation
     * @access  Public
    */
    @Post()
    @UseGuards(JwtGuard)
    @Roles('USER')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Send Bank Transfer Confirmation | Client' })
    async register(@Body() input: TransferConfirmDTO, @Res() res) {
        const result = await this.transferService.create(input);

        return res.status(HttpStatus.CREATED).json({
		statusCode: HttpStatus.CREATED,
		message: 'Create Transfer Confirmation is successful',
		data: result
	});
    }

    /**
     * @route   Get api/v1/transfer_confirms
     * @desc    Get Transfer Confirm list
     * @access  Public
    */

    @Get()
    @ApiOperation({ summary: 'Get all transfer confirm | Backoffice' })

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

    @ApiQuery({
        name: 'optVal',
        required: false,
        explode: true,
        type: String,
        isArray: false
    })

    @ApiQuery({
        name: 'optFields',
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

    async read(@Req() req, @Res() res) {
    	const result = await this.transferService.read(req.query)
        return res.status(HttpStatus.OK).json({
		statusCode: HttpStatus.OK,
		message: 'Managed to get the data',
		total: result.length,
		data: result
	});
    }

    /**
     * @route   Put /api/v1/transfer_confirms/:invoice_number
     * @desc    Set Confirmation by invoice_number
     * @access  Public
     **/

    @Put(':invoice_number')
    @UseGuards(JwtGuard)
    @Roles(...inRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Set Transfer Confirmation by Invoice number | Backoffice' })

    @ApiParam({
		name: 'invoice_number',
		required: true,
		explode: true,
		type: String,
		example: '9221SKU7210305',
		description: 'Invoice Number from order data'
	})

    async confirm(
        @Param('invoice_number') invoice_number: string,
        @Res() res
    ) {
	const result = await this.transferService.confirm(invoice_number);
	return res.status(HttpStatus.OK).json({
		statusCode: HttpStatus.OK,
		message: result
	})
    }
}
