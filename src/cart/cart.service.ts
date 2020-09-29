import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IProduct } from '../product/interfaces/product.interface';
import { ICart } from './interfaces/cart.interface';
import { CartDTO } from './dto/cart.dto';
import { Cart } from '../utils/cart';
import { prepareCart } from '../utils';

@Injectable()
export class CartService {
    constructor(@InjectModel('Product') private productModel: Model<IProduct>) {}

    async fetch(session): Promise<ICart> {
        const { cart } = session;
        console.log(cart);
        const saved = cart || new Cart({});
        return prepareCart(saved);
    }

    async add(session, cartDTO: CartDTO): Promise<{ newCart }> {
        const { cart } = session;
        const { id } = cartDTO;
        const newCart: Cart = new Cart(cart || {});

        try {
            const product = await this.productModel.findById(id);
            newCart.add(product, id);
            return { newCart }
        } catch (error) {
            return { newCart }
        }
    }

    async remove(session, cartDTO: CartDTO): Promise<{ newCart }> {
        const { cart } = session;
        const { id } = cartDTO;
        const newCart: Cart = new Cart(cart || {});

        try {
            const product = await this.productModel.findById(id);
            if (!product) {
                const valid = newCart.check(id);

                if (valid) {
                    const empty = new Cart({});
                    return { newCart: empty }
                }
            }
            newCart.remove(id);
            return { newCart }
        } catch (error) {
            return { newCart }
        }
    }
}
