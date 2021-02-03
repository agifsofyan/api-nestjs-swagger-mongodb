import { 
    Injectable,
    HttpService,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException
} from '@nestjs/common';
import { RAJAONGKIR_SECRET_KEY } from 'src/config/configuration';

const baseUrl = 'https://api.rajaongkir.com/starter'
const headerOpt = {
    headers: {
        key: RAJAONGKIR_SECRET_KEY
    }
}

@Injectable()
export class RajaongkirService {
    constructor(private readonly httpService: HttpService) {}
    
    async provinces(id: string) {
        let ENDPOINT = `${baseUrl}/province`;
        if (id) {
            ENDPOINT = `${baseUrl}/province?id=${id}`;
        }

        try {
            const result = await this.httpService.get(ENDPOINT, headerOpt).toPromise()
            return result.data.rajaongkir   
        } catch (err) {
            const e = err.response
            if(e.status === 404){
                throw new NotFoundException()
            }else if(e.status === 400){
                throw new BadRequestException()
            }else{
                throw new InternalServerErrorException
            }
        }
    }

    async cities(id: string, provinceId: string) {
        let ENDPOINT = `${baseUrl}/city`
        if (id) {
            if (provinceId) {
                ENDPOINT = `${baseUrl}/city?id=${id}&province=${provinceId}`
            } else {
                ENDPOINT = `${baseUrl}/city?id=${id}`;
            }
        } else {
            if (provinceId) {
                ENDPOINT = `${baseUrl}/city?province=${provinceId}`
            }
        }
        // return this.httpService.get(ENDPOINT, headerOpt).pipe(map(res => res.data))

        try {
            const result = await this.httpService.get(ENDPOINT, headerOpt).toPromise()
            return result.data.rajaongkir   
        } catch (err) {
            const e = err.response
            if(e.status === 404){
                throw new NotFoundException()
            }else if(e.status === 400){
                throw new BadRequestException()
            }else{
                throw new InternalServerErrorException
            }
        }
    }

    async cost(input: any) {
        input.origin = '457'
        input.courier = 'tiki'
        let ENDPOINT = `${baseUrl}/cost`
        if (input.courier) {
            if(input.courier !== "jne" && input.courier !== "pos" && input.courier !== "tiki"){
                throw new BadRequestException('courier available in jne, pos and tiki')
            }
        }

        try {
            const result = await this.httpService.post(ENDPOINT, input, headerOpt).toPromise()
            return result.data.rajaongkir
        } catch (err) {
            // console.log('error====== ', err)
            const e = err.response
            if(e.status === 404){
                throw new NotFoundException()
            }else if(e.status === 400){
                throw new BadRequestException()
            }else{
                throw new InternalServerErrorException
            }
        }
    }
}
