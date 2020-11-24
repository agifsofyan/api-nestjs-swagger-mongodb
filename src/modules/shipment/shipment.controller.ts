import { 
    Controller,
    Post,
    UseGuards,
    Body,
    Param,
    Get
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
    
    async getShipmentOrder() {
        return await this.shipmentService.getAll()
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
    
    async shipmentOrderDetail(@Param('shipment_id') shipment_id: string) {
        return await this.shipmentService.getById(shipment_id)
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
        @Body() shipmentDto: CreateShipmentDto
      ) {
        return await this.shipmentService.add(user, shipmentDto)
    }
}
