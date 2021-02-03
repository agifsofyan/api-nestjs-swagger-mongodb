import { 
    Injectable,
    HttpService,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException
} from '@nestjs/common';

const baseUrl = 'https://api.zoom.us/v1/'
const headerOpt = {
    headers: {
        api_key: process.env.ZOOM_API_KEY,
        api_secret: process.env.ZOOM_API_SECRET,
        data_type: 'JSON'
    }
}

@Injectable()
export class ZoomService {
    constructor(private readonly httpService: HttpService) {}

    async createWebinar(input: any) {
       
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
            console.log('error======>', err)
            // const e = err.response
            // if(e.status === 404){
            //     throw new NotFoundException()
            // }else if(e.status === 400){
            //     throw new BadRequestException()
            // }else{
            //     throw new InternalServerErrorException
            // }
        }
    }
}
