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
    ApiQuery,
    ApiBearerAuth
} from '@nestjs/swagger';

import { ShipmentService } from './shipment.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateShipmentDto } from './dto/shipment.dto';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';

@ApiTags('Shipments')
@Controller('shipments')
export class ShipmentController {
    constructor(private shipmentService: ShipmentService) {}

    /**
     * @route   GET api/v1/carts/add
     * @desc    Add product to cart
     * @access  Public
     */
    @Post('/add')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add product to cart' })
    
    async addShipmentOrder(
        @User() user: IUser,
        @Body() shipmentDto: CreateShipmentDto
      ) {
        return await this.shipmentService.add(user, shipmentDto)
    }
}
