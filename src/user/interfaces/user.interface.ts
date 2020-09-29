import { Document } from 'mongoose';

import { ICart } from '../../cart/interfaces/cart.interface';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: string;
    last_login: Date;
    type: string;
    cart?: ICart;
    readonly created_at: Date;
    updated_at: Date;
}
