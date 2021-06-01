import {
    Injectable,
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
	NotImplementedException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IBankTransfer } from './interfaces/banktransfer.interface';
import { OptQuery } from 'src/utils/OptQuery';
import { IOrder } from 'src/modules/order/interfaces/order.interface';
import { currencyFormat } from 'src/utils/helper';
import { MailService } from 'src/modules/mail/mail.service';
import { IPaymentMethod } from '../method/interfaces/payment.interface';

@Injectable()
export class BanktransferService {
    constructor(
        @InjectModel('BankTransfer') private readonly transferModel: Model<IBankTransfer>,
        @InjectModel('Order') private readonly orderModel: Model<IOrder>,
        @InjectModel('PaymentMethod') private readonly paymentModel: Model<IPaymentMethod>,
		private readonly mailService: MailService
    ) {}

    async create(input: any) {
		if(input.destination_bank){
			const destination = {$regex: ".*" + input.destination_bank + ".*", $options: "i"}
			const payment = await this.paymentModel.findOne({ name: destination, vendor: 'Laruno', info: 'Bank-Transfer' })
			input.destination_account = payment.account_name
			input.destination_number = payment.account_number
		}

        const query = new this.transferModel(input)
        await query.save();
        return query
    }

    async read(options: OptQuery) {
		const {
			offset,
			limit,
			sortby,
			sortval,
			fields,
			value,
			optFields,
			optVal
		} = options;

		const offsets = (offset == 0 ? offset : (offset - 1))
		const skip = offsets * limit
		const sortvals = (sortval == 'asc') ? 1 : -1

		var filter: object = { [fields]: value  }

		if(optFields){
			if(!fields){
				filter = { [optFields]: optVal }
			}
			filter = { [fields]: value, [optFields]: optVal }
		}

		if (sortby){
			if (fields) {
				return await this.transferModel
				.find(filter)
				.skip(Number(skip))
				.limit(Number(limit))
				.sort({ [sortby]: sortvals })
			} else {
				return await this.transferModel
				.find()
				.skip(Number(skip))
				.limit(Number(options.limit))
				.sort({ [options.sortby]: sortvals })
			}
		}else{
			if (options.fields) {
				return await this.transferModel
				.find(filter)
				.skip(Number(skip))
				.limit(Number(options.limit))
				.sort({ 'updated_at': 'desc' })
			} else {
				return await this.transferModel
				.find(filter)
				.skip(Number(skip))
				.limit(Number(options.limit))
				.sort({ 'updated_at': 'desc' })
			}
		}
    }

    async confirm(invoice_number: string) {
		var transfer = await this.transferModel.findOne({invoice_number: invoice_number})
		var order = await this.orderModel.findOne({invoice: invoice_number})
		// .populate('items.product_info', ['_id', 'type', 'time_period'])

		if(!transfer || !order){
			throw new NotFoundException(`invoice ${invoice_number} not found in order or in banktransfer`)
		}

		transfer.is_confirmed = true

		order.status = "PAID",
		order.payment.status =  "PAID"

		try {
			await order.save()
			await transfer.save()
		} catch (error) {
			throw new NotImplementedException(`error cannot confirm the order`)
		}
       
		
		try {
		 	await this.sendMail(invoice_number)
		} catch (error) {
			throw new NotImplementedException(`error cannot send email`)
		}
		
		return 'order was confirmed successfully'
    }

	private async sendMail(invoice_number) {
		var order = await this.orderModel.findOne({invoice: invoice_number})

        	var orderTb

		try {
			orderTb = order.items.map(item => {
				return `<tr>
				<td class="es-m-txt-l" bgcolor="#ffffff" align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:30px;padding-right:30px;"> <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:24px;font-family:lato, helvetica, arial, sans-serif;line-height:27px;color:#666666;">${item.product_info.name}</p> </td><td class="es-m-txt-l" bgcolor="#ffffff" align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:30px;padding-right:30px;"> <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:24px;font-family:lato, helvetica, arial, sans-serif;line-height:27px;color:#666666;">${currencyFormat(item.sub_price)} x ${item.quantity}</p> </td>
				</tr>`
			})
		} catch (error) {
			throw new NotFoundException('product not found')
		}
        const data = {
            name: order.user_info.name,
            from: "Order " + process.env.MAIL_FROM,
            to: order.user_info.email,
            subject: 'Thank you. Payment has been confirmed',
            type: 'order',
            orderTb: orderTb,
            totalPrice: currencyFormat(order.total_price)
        }

        const result = await this.mailService.templateGenerate(data)

		return result
	}
}
