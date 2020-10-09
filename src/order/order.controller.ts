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
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';

import { IUser } from '../user/interfaces/user.interface';
import { User } from '../user/user.decorator';
import { Cart } from '../utils/cart';
import { prepareCart } from '../utils';
import { OrderService } from './order.service';

import { SearchDTO } from './dto/order.dto';

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
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Checkout order' })
    @ApiBearerAuth()
    @ApiHeader({
        name: 'Bearer',
        description: 'Token authentication.'
    })
    async order(@Session() session, @User() user: IUser) {
        console.log(session);

        const res = await this.orderService.checkout(user, session);
            
        if (res.data && !res.error) {
            const empty = new Cart({});
            session.cart = empty;
            return { ...res, cart: empty };
        } else {
            return { ...res, cart: prepareCart(session.cart) }
        }

        // try {
        //     const res = await this.orderService.checkout(user, session);
            
        //     if (res.data && !res.error) {
        //         const empty = new Cart({});
        //         session.cart = empty;
        //         return { ...res, cart: empty };
        //     } else {
        //         return { ...res, cart: prepareCart(session.cart) }
        //     }
        // } catch (error) {
        //     console.log(error);
        //     throw new UnprocessableEntityException();
        // }
    }


    /**
     * @route   GET /api/v1/orders/list
     * @desc    Get all order
     * @access  Public
     */

    @Get('list')

    async findAll(@Req() req, @Res() res) {
        const result = await this.orderService.findAll(req.query);
        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            message: `Success get orders`,
            total: result.length,
            data: result
        });
    }

    /**
     * @route   Get /api/v1/orders/:id/detail
     * @desc    Get order by Id
     * @access  Public
     **/

    @Get(':id/detail')

    async findById(@Param('id') id: string, @Res() res) {
        // console.log('id::', id)
        const result = await this.orderService.findById(id);
        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            message: `Success get order by id ${id}`,
            data: result
        });
    }

    /**
	 * @route   Post /api/v1/porders/find/search
	 * @desc    Search order
	 * @access  Public
	 **/

	@Post('find/search')

	async search(@Res() res, @Body() search: SearchDTO) {
		const result = await this.orderService.search(search);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success search order`,
			total: result.length,
			data: result
		});
	}
}
