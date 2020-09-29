import { Controller, Post, Session, UnprocessableEntityException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';

import { IUser } from '../user/interfaces/user.interface';
import { User } from '../user/user.decorator';
import { prepareCart } from '../utils';
import { XenditService } from '../xendit/xendit.service';
import { OrderService } from './order.service';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
    constructor(
        private xenditService: XenditService,
        private orderService: OrderService
    ) {}

    /**
     * @route   POST api/v1/orders/checkout
     * @desc    Order product cart
     * @access  Public
     */
    @Post('/checkout')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Checkout order' })
    @ApiBearerAuth()
    @ApiHeader({
        name: 'Bearer',
        description: 'Token authentication.'
    })
    async order(@Session() session, @User() user: IUser) {
        const res = await this.xenditService.xenditInvoice(session, user);
           
        if (res.data && res.error == null) {
            return await this.orderService.checkout(res.data, res.cart, res.user);
        } else {
            return { ...res, cart: prepareCart(session.cart) }
        }
    }
}
