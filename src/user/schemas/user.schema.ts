import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
    @Prop()
    name: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    phone_number: string;

    @Prop()
    last_login: Date;

    @Prop({ default: Date.now })
    created_at: Date;

    @Prop()
    updated_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);