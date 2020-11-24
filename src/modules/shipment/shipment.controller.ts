import { 
    Controller,
    Post,
    UseGuards,
    Body,
    Param,
    Get,
    Res,
    HttpStatus
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth
} from '@nestjs/swagger';

import { ShipmentService } from './shipment.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateShipmentDto } from './dto/shipment.dto';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';

@ApiTags("Shipments_B")
@Controller('shipments')
export class ShipmentController {
    constructor(private shipmentService: ShipmentService) {}

    /**
     * @route   GET api/v1/shipment/list
     * @desc    Get Shipments
     * @access  Public
     */
    @Get('/list')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'get shipments | Backofffice' })
    
    async getShipmentOrder(@Res() res) {
        const result = await this.shipmentService.getAll()

        return res.status(HttpStatus.OK).json({
          statusCode: HttpStatus.OK,
          message: 'Get shipments is successful',
          total: result.length,
          data: result
        });
    }

    /**
     * @route   GET api/v1/shipment/list
     * @desc    Get Shipment detai;
     * @access  Public
     */
    @Get('/detail/:shipment_id')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'get shipments | Backofffice' })
    
    async shipmentOrderDetail(@Param('shipment_id') shipment_id: string, @Res() res) {
        const result = await this.shipmentService.getById(shipment_id)

        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Get shipment detail is successful',
			data: result
		});
    }

    /**
     * @route   GET api/v1/shipment/add
     * @desc    Add new Shipment
     * @access  Public
     */
    @Post('/add')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add new shipment order | Backofffice' })
    
    async addShipmentOrder(
        @User() user: IUser,
        @Body() shipmentDto: CreateShipmentDto,
        @Res() res
      ) {
        const result = await this.shipmentService.add(user, shipmentDto)

        return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'Add new shipment is successful',
			data: result
		});
    }
}
