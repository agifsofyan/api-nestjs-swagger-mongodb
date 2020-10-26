import { 
    Controller, 
    Post, 
    Session, 
    UnprocessableEntityException, 
    UseGuards,
    Get,
    Req,
    Res,
    HttpStatus,
    Param,
    Body
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { IUser } from '../user/interfaces/user.interface';
import { OrderService } from './order.service';
import { JwtGuard } from '../auth/guards/jwt.guard';

import { OrderDto } from './dto/order.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
    constructor(
        private orderService: OrderService
    ) {}
    
    /**
     * @route   GET api/v1/order/store
     * @desc    Create order
     * @access  Public
     */
    @Post('store')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    async storeCart(@Req() req, @Body() orderDto: OrderDto) {
        const user = req.user
        return await this.orderService.store(user, orderDto)
    }
}
