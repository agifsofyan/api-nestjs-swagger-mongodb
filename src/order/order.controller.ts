import { Controller, HttpStatus, Post, Session, UnprocessableEntityException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';

import { IUser } from '../user/interfaces/user.interface';
import { User } from '../user/user.decorator';
import { Cart } from '../utils/cart';
import { prepareCart } from '../utils';
import { OrderService } from './order.service';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
    constructor(
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
        try {
            // const res = await this.xenditService.xenditInvoice(user, cartItem.total_price);
            const res = await this.orderService.checkout(user, session);
            
            if (res.error == null && res.data) {
                const empty = new Cart({});
                session.cart = empty;
                return { ...res, cart: empty };
            } else {
                return { ...res, cart: prepareCart(session.cart) }
            }
        } catch (error) {
            throw new UnprocessableEntityException();
        }
    }
}
