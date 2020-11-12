import { Injectable, BadRequestException, NotFoundException, HttpService, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import {  } from 'src/config/configuration';
import { IShipment } from './interfaces/shipment.interface';
import { ProfileService } from '../profile/profile.service';
import { IUser } from '../user/interfaces/user.interface';

import { NINJAID, NINJAKEY } from 'src/config/configuration';
import { env } from 'process';

const baseUrl = 'api.ninjavan.co';
const headerConfig = {
    headers: {
        'Authorization': `Bearer ${process.env.NINJA_TOKEN}`,
        'Content-Type': 'application/json'
    },
}

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class ShipmentService {
    constructor(
		@InjectModel('Shipment') private readonly shipmentModel: Model<IShipment>,
		@InjectModel('User') private readonly userModel: Model<IUser>,
		private readonly profileService: ProfileService,
		private http: HttpService
    ) {}

    async add(user, shipmentDto): Promise<IShipment> {
        
        const checkUser = await this.profileService.getProfile(user)

        if(!checkUser){
            throw new NotFoundException('User or Address not found')
        }
        // console.log('checkUser', checkUser)
        
        var checkAddress = await this.profileService.getOneAddress(user, shipmentDto.addres_id)
        // console.log('checkAddress', checkAddress)
        
        if(Object.keys(checkAddress).length==0){
            throw new NotFoundException('User or Address not found')
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
                items: shipmentDto.items,
                dimensions: {
                    weight: 2 // shipmentDto.weight
                }
            }
        }

        const url = `${baseUrl}/countryCode/4.1/orders`

        try {
            this.send(url, body)
        } catch (error) {
            return error
        }

        const shiper = new this.shipmentModel(body)
        await shiper.save()
        return shiper
    }

    private async send(url, body){
        try {
            const query = await this.http.post(url, body, headerConfig).toPromise()
            console.log('query', query)
            return query

        } catch (error) {
            console.log(error.response.status)
            console.log(error.response.statusText)
            const { status, statusText } = error.response
            if(status == 400){
               throw new BadRequestException(statusText)
            }else if (status == 404){
                throw new NotFoundException(statusText)
            }else{
                throw new InternalServerErrorException(statusText)
            }
        }
    }

    // private async ninjaAuth(userId){
    //     const url = `${baseUrl}/ID/2.0/oauth/access_token`
    //     const body = {
    //         "client_id": NINJAKEY,
    //         "client_secret": NINJAKEY,
    //         "grant_type": "client_credentials"
    //     }

    //     try {
    //         const query = await this.http.post(url, body).toPromise()
    //         console.log("query", query)
    //         const nToken = query.data.access_token
            
    //         const createToken = await this.userModel.findOneAndUpdate(
    //             { _id: userId },
    //             { $set: { n_token: nToken } }
    //         )

    //         console.log('createTOken', createToken)

    //         return nToken
    //     } catch (error) {
    //         const e = error.response
    //         console.log('e', e)
    //     }
    // }
}
