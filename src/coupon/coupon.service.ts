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

            console.log('result', result)
			return result.data.data
		}catch(error){
            const e = error.response
            if(e.status === 400){
                throw new BadRequestException(e.data.message)
            }else if(e.status === 401){
                throw new UnauthorizedException(e.data.message)
            }else if(e.status === 404){
                throw new NotFoundException(e.data.message)
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
        
        return this.getApi(URL)
    }

	async findById(id: string) {
        var URL = `${baseUrl}/${id}`

	 	return this.getApi(URL)
    }
    
    async findByCode(code: string) {
        var URL = `${baseUrl}/code/${code}`
        console.log(URL)
        
        return this.getApi(URL)
    }

    async calculate(code: string, price: number){
        const coupon = await this.findByCode(code)

        const sale = (coupon.value / 100) * price

        var afterSale = price - sale

        if(sale > coupon.max_discount){
            afterSale = price - coupon.max_discount
        }

        return afterSale
    }
}
