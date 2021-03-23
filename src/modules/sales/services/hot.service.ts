import { 
	Injectable
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IProduct } from 'src/modules/product/interfaces/product.interface';

@Injectable()
export class HotService {
    constructor(
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
	) {}

    async setHeaderOnProducts(input: any) {
        const query = await this.productModel.findOneAndUpdate(
            { _id: input.product_id },
            { "feature.active_header": true }
        )

        return query
    }

    // async listOfUTM(status?: string) {
    //     var match:any = {}
    //     if(status) match.status = status;
    //     return await this.utmModel.find(match)
    // }
}
