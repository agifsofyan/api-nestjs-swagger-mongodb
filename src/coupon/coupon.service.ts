import {
    Injectable,
    HttpService,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
    UnauthorizedException
} from '@nestjs/common';
import { ObjToString } from '../utils/optquery';

var { BACKOFFICE_API_PORT, CLIENT_IP } = process.env

var baseUrl = `http://${CLIENT_IP}:${BACKOFFICE_API_PORT}/api/v1/coupons`;

@Injectable()
export class CouponService {
    constructor(private http: HttpService) { }

    private async getApi(url) {
        try{
            const result = await this.http.get(url).toPromise()
			return result.data.data
		}catch(error){
            const e = error.response
            if(e.status === 400){
                throw new BadRequestException(e.data)
            }else if(e.status === 401){
                throw new UnauthorizedException(e.data)
            }else if(e.status === 404){
                throw new NotFoundException(e.data)
            }else{
                throw new InternalServerErrorException
            }
		}
    }

    async findAll(query: any){
        var URL = baseUrl

		if(query){
            const Query = ObjToString(query)
		    URL = `${URL}?${Query}`
        }
        
        return await this.getApi(URL)
    }

	async findById(id: string) {
        var URL = `${baseUrl}/${id}`

	 	return await this.getApi(URL)
    }
    
    async findByCode(code: string) {
        var URL = `${baseUrl}/code/${code}`
        
        const getAPI = await this.getApi(URL)
        return getAPI
    }

    async calculate(code: string, price: number){
        const coupon = await this.findByCode(code)

        var value = (coupon.value / 100) * price

        if(value > coupon.max_discount){
            value = coupon.max_discount
        }

        return { coupon, value }
    }
}
