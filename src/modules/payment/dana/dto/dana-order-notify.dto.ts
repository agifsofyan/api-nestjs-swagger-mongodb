import {
    IsNotEmpty,
    IsString,
    IsEmail,
    IsObject,
    IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const danaKey = {
    merchandId: process.env.MID,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
}

export class DanaOrderNotifyDTO {
    @ApiProperty({
        example: {
            version: "2.0",
            function: "dana.acquiring.order.finishNotify",
            clientId: danaKey.clientId,
            reqTime: "2021-03-24T18:44:57.719+00:00",
            reqMsgId: "25321SKU3613090",
            clientSecret: danaKey.clientSecret
        },
        description: 'Header',
        format: 'object'
    })
    @IsNotEmpty()
    @IsObject()
    head: {
        version: string,
        function: string,
        clientId: string,
        reqTime: string,
        reqMsgId: string,
        clientSecret: string
    };

    @ApiProperty({
        example: {
            acquirementId: "20210325111212800110166400739921087",
            merchantTransId: "361791168976",
            finishedTime: "2021-03-24T18:44:57.719+00:00",
            createdTime: "2021-03-24T18:44:57.719+00:00",
            merchantId: danaKey.merchandId,
            orderAmount: {
                currency:"IDR",
                value: '5000'
            },
            acquirementStatus:"SUCCESS",
            paymentView: {
                payRequestExtendInfo:"{\"key\":\"value\"}",
                extendInfo:"{\"topupAndPay\":\"false\", \"paymentStatus\":\"SUCCESS\"}"
            },
            extendInfo:"{\"key\": \"value\"}"
        },
        description: 'Body',
        format: 'object'
    })
    @IsNotEmpty()
    @IsObject()
    body: {
        acquirementId: string,
        merchantTransId: string,
        finishedTime: string,
        createdTime: string,
        merchantId: string,
        orderAmount: {
            currency: string,
            value: string
        },
        acquirementStatus: string
        paymentView: {
            payRequestExtendInfo: string,
            extendInfo: string
        },
        extendInfo: string
    };
}