import { 
	Injectable, 
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IOrder } from '../order/interfaces/order.interface';
import { IProfile } from '../profile/interfaces/profile.interface';
import { IFollowUp } from './interfaces/followup.interface';
import { ITemplate } from '../templates/interfaces/templates.interface';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class FollowupService {
    constructor(
		@InjectModel('FollowUp') private readonly followModel: Model<IFollowUp>,
		@InjectModel('Profile') private readonly profileModel: Model<IProfile>,
		@InjectModel('Order') private readonly orderModel: Model<IOrder>,
		@InjectModel('Template') private readonly templateModel: Model<ITemplate>,
    ) {}

	async sendWA(agentID: string, order_id: string, input: any): Promise<IFollowUp> {
		input.agent = agentID
		
		var followUp:any = await this.followModel.findOne({ 'order': order_id })

		if(!followUp) throw new NotFoundException('followup not found');

		const userProfile = await this.profileModel.findOne({ user: followUp.user })
		
		if(!userProfile) throw new NotFoundException('user / profile not found')
		const wa = userProfile.phone_numbers.filter(phone => phone.isWhatsapp == true)
		
		const findFollow = followUp.activity.findIndex(x => x.next === true);
		const followNow = (findFollow == -1) ? 0 : findFollow
		const followNext = followNow + 1

		followUp.activity[followNow] = {
			date: new Date(),
			message: input.message,
			is_done: true,
			agent: agentID,
			next: false
		}

		if(followNext < 5){
			followUp.activity[followNext].next = true
		}
		
		if(followNext == 5){
			followUp.is_complete = true
		}

		await followUp.save()

		var url = "https://api.whatsapp.com/";``
		url += `send?phone=${wa[0].country_code + wa[0].phone_number}&text=${input.message.split(" ").join("%20")}`

		followUp = followUp.toObject()
		followUp.redirect = url

		return followUp
	}

	async getFollowUp(orderID: string) {
		const order = await this.orderModel.findById(orderID)
		.populate('user_info', ['_id', 'name', 'email'])
		
		if(!order) throw new NotFoundException(`order with id: ${orderID} not found`);
		var activity = [];
		for(let i=0; i<5; i++){
			let messageTemplate = await this.templateModel.findOne({ name: `followup${i+1}` }).then(res => {
			const result = res.versions.filter(val => val.active === true)
				return result[0].template
			})
	
			activity[i] = {
				date: null,
				message: messageTemplate.replace('{{name}}', order.user_info.name).replace('{{total_price}}', order.total_price.toString()), 
				is_done: false
			}
		}

		const followUp = {
			user: order.user_info._id,
			order: ObjectId(orderID),
			activity: activity
		}
			
		await this.followModel.findOneAndUpdate(
			{ order: orderID },
			{ followUp },
			{ upsert: true, new: true }
		)
		
		const result = await this.followModel.findOne({ order: orderID })
		console.log('result', result)
		return result
	}

	async setFollowUpTemplate(title: string, template: any, by: string) {
		var templates:any = await this.templateModel.findOne({name: title})

		if(!templates){
			templates = new this.templateModel({
				name: title,
				description: 'Follow Up Template',
				type: 'WA',
				by: by,
			})
		}

		templates.versions = [template]

		await templates.save()

		return templates
	}
}
