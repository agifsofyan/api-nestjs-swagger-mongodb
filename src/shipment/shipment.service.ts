import { Injectable, BadRequestException, NotFoundException, HttpService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import {  } from 'src/config/configuration';
import { IShipment } from './interfaces/shipment.interface';
import { ProfileService } from '../profile/profile.service';
import { IUser } from '../user/interfaces/user.interface';
import { WriteFile, ReadFile } from 'src/utils/optquery';
import { NINJAID, NINJAKEY } from 'src/config/configuration';
import * as moment from 'moment';

const ObjectId = mongoose.Types.ObjectId;

const baseUrl = 'https://api.ninjavan.co';

@Injectable()
export class ShipmentService {
    constructor(
		@InjectModel('Shipment') private readonly shipmentModel: Model<IShipment>,
		@InjectModel('User') private readonly userModel: Model<IUser>,
		private readonly profileService: ProfileService,
		private http: HttpService
    ) {}

    async getAll(){
        const query = await this.shipmentModel.aggregate([
            { $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user_info'
            }},
			{ $unwind: {
                path: '$user_info',
                preserveNullAndEmptyArrays: true
            }},
            { $project: {
				user_id: 1,
				"user_info.name": 1,
				"user_info.email": 1,
				"user_info.phone_number": 1,
				requested_tracking_number: 1,
                reference: 1,
                // from: 1,
                to:1,

                "parcel_job.pickup_service_level": 1,
                "parcel_job.pickup_date": 1,
                "parcel_job.pickup_timeslot": 1,
                "parcel_job.delivery_start_date": 1,
                "parcel_job.delivery_timeslot": 1,
                "parcel_job.items": 1,
                "parcel_job.dimensions": 1,

                created_date: 1,
                updated_date: 1,
                expired_date: 1
			}}
        ])

        return query
    }

    async getById(shipmentId){
        const query = await this.shipmentModel.aggregate([
            { $match: { _id: ObjectId(shipmentId) }},
            { $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user_info'
            }},
			{ $unwind: {
                path: '$user_info',
                preserveNullAndEmptyArrays: true
            }},
            { $project: {
				user_id: 1,
				"user_info.name": 1,
				"user_info.email": 1,
				"user_info.phone_number": 1,
				requested_tracking_number: 1,
                reference: 1,
                from: 1,
                to:1,
                parcel_job: 1,
                created_date: 1,
                updated_date: 1,
                expired_date: 1
			}}
        ])

        return query.length <= 0 ? {} : query[0]
    }

    async add(user, shipmentDto): Promise<IShipment> {    
	const checkUser = await this.profileService.getProfile(user)

        if(!checkUser){
            throw new NotFoundException('user not not found')
        }
        
        var checkAddress = await this.profileService.getOneAddress(user, shipmentDto.address_id)
        
        if(Object.keys(checkAddress).length==0){
            throw new NotFoundException('address_id not valid or not found')
        }
        
        const body = {
            user_id: user["userId"],
            requested_tracking_number: shipmentDto.requested_tracking_number,
            reference: {
                merchant_order_number: shipmentDto.merchant_order_number
            },
            from: {
                name: "Laruno",
                phone_number: "+622122225573",
                email: "info@laruno.com",
                address: {
                    address1: "Komplek Scientia Square. Ruko Darwin Timur No.2",
                    area: "Gading Serpong",
                    city: "Tangerang",
                    state: "Banten",
                    address_type: "office",
                    country: "ID",
                    postcode: "15339"
                }
            },
            to: {
                name: checkUser.user.name,
                phone_number: checkUser.user.phone_number,
                email: checkUser.user.email,
                address: {
                    address1: checkAddress['detail_address'],
                    kelurahan: checkAddress['sub_district'],
                    kecamatan: checkAddress['districts'],
                    city: checkAddress['city'],
                    province: checkAddress['province'],
                    country: "ID",
                    postcode: checkAddress['postal_code']
                }
            },
            parcel_job: {
		pickup_date: new Date('2020-11-16T20:03:58.289Z'),
            	delivery_start_date: new Date('2020-11-16T20:03:58.289Z'),
                items: shipmentDto.items,
                dimensions: {
                    weight: shipmentDto.weight ? shipmentDto.weight : 0
                }
            }
        }

        var shiper
        try {
            shiper = new this.shipmentModel(body)
	    /**
        } catch (err) {
            const e = err.response
            if(e && e.data){
                throw new BadRequestException(e.data)
            }
            throw new BadRequestException(e)
        }
        
        try {
	*/
            await this.send(`${baseUrl}/ID/4.1/orders`, shiper)
            await shiper.save()
            return shiper
        } catch (err) {
            const e = err.response
            if(e && e.data){
                throw new BadRequestException(e.data)
            }
            throw new BadRequestException(e)
        }
    }

    private async send(url, body){
        const ninjaAuth = await ReadFile('ninja-auth.json', true)
        var token = ninjaAuth.access_token

        if(token === undefined){
            const getAuth = await this.ninjaAuth()
            token = getAuth.access_token
        }

	// console.log('body', body)

        try {
            const headerConfig = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }

            const query = await this.http.post(url, body, headerConfig).toPromise()
            return query.data 
        } catch (err) {
            const e = err.response
             if(e && e.data){
                throw new BadRequestException(e.data)
            }
            throw new BadRequestException(e)
        }
    }

    private async ninjaAuth(){
        
        try {
            const url = `${baseUrl}/ID/2.0/oauth/access_token`

	    const data = {
                "client_id": NINJAID,
                "client_secret": NINJAKEY,
                "grant_type": "client_credentials"
	    }

            // console.log('data', data)
            const query = await this.http.post(url, data).toPromise()

            const result = query.data

            const body = JSON.stringify(result, null, 4)
            
            await WriteFile("ninja-auth.json", body, false)

            const ninjaAUth = await ReadFile('ninja-auth.json', true)

            return ninjaAUth
        } catch (err) {
            const e = err.response
            if(e && e.data){
                throw new BadRequestException(e.data)
            }
            throw new BadRequestException(e)
        }
    }
}
