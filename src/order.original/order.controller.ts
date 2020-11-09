import { 
    Controller, 
    Post, 
    Session, 
    UnprocessableEntityException, 
    UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { IUser } from '../user/interfaces/user.interface';
import { User } from '../user/user.decorator';
import { Cart } from '../utils/cart';
import { prepareCart } from '../utils';
import { OrderService } from './order.service';
import { JwtGuard } from '../auth/guards/jwt.guard';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
    constructor(
        private orderService: OrderService
    ) {}

    /**
     * @route   POST api/v1/orders/checkout
     * @desc    Order order cart
     * @access  Public
     */
    @Post('/checkout')
    @UseGuards(JwtGuard)
    @ApiOperation({ summary: 'Checkout order' })
    @ApiBearerAuth()
    async order(@Session() session, @User() user: IUser) {
        console.log(session);
        try {
            const res = await this.orderService.checkout(user, session);
            
            if (res.data && !res.error) {
                const empty = new Cart({});
                session.cart = empty;
                return { ...res, cart: empty };
            } else {
                return { ...res, cart: prepareCart(session.cart) }
            }
        } catch (error) {
            console.log(error);
            throw new UnprocessableEntityException();
        }
    }
}
