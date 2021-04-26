import { Injectable, BadRequestException, NotFoundException, HttpService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import {  } from 'src/config/configuration';
import { IShipment } from './interfaces/shipment.interface';
import { ProfileService } from '../profile/profile.service';
import { IUser } from '../user/interfaces/user.interface';
import { WriteFile, ReadFile } from 'src/utils/OptQuery';
import { NINJAID, NINJAKEY } from 'src/config/configuration';

const ObjectId = mongoose.Types.ObjectId;

const baseUrl = 'https://api.ninjavan.co';
// const baseUrl = 'https://api-sandbox.ninjavan.co'

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
            throw new NotFoundException('User or Address not found not not found')
        }
        
        var checkAddress = await this.profileService.getOneAddress(user, shipmentDto.address_id)
        
        if(Object.keys(checkAddress).length==0){
            throw new NotFoundException('address_id not valid or not found')
        }

        const userContact = checkUser.phone_numbers.filter(numb => numb.isDefault == true)
        
        const body = {
            user_id: user._id,
            requested_tracking_number: shipmentDto.requested_tracking_number,
            reference: {
                merchant_order_number: shipmentDto.merchant_order_number
            },
            from: {
                name: "Laruno",
                phone_number: "+622122225573",
                email: "info@laruno.com",
                address: {
                    address_type: "office",
                    country: "ID",
                    detail: "Komplek Scientia Square. Ruko Darwin Timur No.2",
                    province: 'Banten',
                    city: 'Tangerang',
                    subdistrict: 'Gading Serpong',
                    village: 'Pagedangan',
                    postcode: "15339"
                }
            },
            to: {
                name: checkUser.user.name,
                phone_number: userContact ? userContact[0].country_code + userContact[0].phone_number : '',
                email: checkUser.user.email,
                address: {
                    country: "ID",
                    detail: checkAddress['detail_address'],
                    province: checkAddress['province'],
                    city: checkAddress['city'],
                    subdistrict: checkAddress['subdistrict'],
                    village: checkAddress['village'] ? checkAddress['village'] : '',
                    postcode: checkAddress['postal_code']
                }
            },
            parcel_job: {
		        // pickup_date: new Date('2020-11-16T20:03:58.289Z'),
            	// delivery_start_date: new Date('2020-11-16T20:03:58.289Z'),
                items: shipmentDto.items,
                dimensions: {
                    weight: shipmentDto.weight ? shipmentDto.weight / 1000 : 0 // parse from gram to kg
                }
            }
        }
        
        var shiper = new this.shipmentModel(body)
        

        // console.log('shiper', shiper)

        try {
            var shipmentInput:any = shiper.toObject()
            shipmentInput.from.address.address1 = shiper.from.address.detail
            shipmentInput.from.address.state = shiper.from.address.province
            shipmentInput.from.address.area = shiper.from.address.subdistrict

            shipmentInput.to.address.address1 = shiper.to.address.detail
            shipmentInput.to.address.kecamatan = shiper.to.address.subdistrict
            shipmentInput.to.address.kelurahan = checkAddress['village'] ? checkAddress['village'] : ''

            delete shipmentInput.from.address.detail
            delete shipmentInput.from.address.subdistrict
            delete shipmentInput.from.address.village

            delete shipmentInput.to.address.address_type
            delete shipmentInput.to.address.detail
            delete shipmentInput.to.address.subdistrict
            delete shipmentInput.to.address.village

            await this.send(`${baseUrl}/ID/4.1/orders`, shipmentInput)
        } catch (err) {
            console.log('err', err)
            const error = err.response.error.details.length == 0 ? err.response.error.message : err.response.error.details;
            throw new BadRequestException(error)
        }

        try {
            await shiper.save()
        } catch (err) {
            console.log('err', err)
            throw new BadRequestException("can't save the shipment")
        }

        return shiper
    }

    private async send(url, body){
        const ninjaAuth = await ReadFile('ninja-auth.json', true)
        var token = ninjaAuth.access_token

        if(token === undefined){
            const getAuth = await this.ninjaAuth()
            token = getAuth.access_token
        }

        try {
            const headerConfig = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }

            console.log('headerConfig', headerConfig)

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
