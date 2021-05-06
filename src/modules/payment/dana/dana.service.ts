import { BadGatewayException, BadRequestException, HttpService, Injectable, InternalServerErrorException, NotFoundException, NotImplementedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { isCallerMobile, toSignature, verify, dateFormat, createOrder, rfc3339, randomIn, uuidv4 } from "src/utils/helper";
import { expiring } from "src/utils/order";
import { IToken } from "../../token/interfaces/token.interface";
import { map } from "rxjs/operators";
import { StrToUnix } from "src/utils/StringManipulation";
import * as moment from "moment";
import { IDana } from "./interfaces/dana.interface";

const baseUrl = "https://api.saas.dana.id";
// const baseUrl = "https://api-sandbox.saas.dana.id";
const headerConfig = {
    headers: { 
        "Content-Type": "application/json"
    },
}

const danaKey = {
    merchandId: process.env.MID,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
}

const reqTime = moment(new Date()).format()

@Injectable()
export class DanaService {
    constructor(
        private http: HttpService,
        @InjectModel("Token") private readonly tokenModel: Model<IToken>,
        @InjectModel("Dana") private readonly danaModel: Model<IDana>,
    ) { }

    private danaHead(func: string, uniqueID) {
        return {
            "version": "2.0",
            "function": func,
            "clientId": danaKey.clientId,
            "reqTime": reqTime,
            "reqMsgId": uniqueID,
            "clientSecret": danaKey.clientSecret,
            "reserve":"{}"
        }
    }
    
    async danarequest(req: any, input: any) {
        const mobile = isCallerMobile(req)

        // let csrf = RandomStr(30)
        var oauthURL = 'https://m.dana.id/m/portal/oauth'
        // const callbackUrl = "https://laruno.id/payments/notification"
        const callbackUrl = "https://laruno.id/payments/callback"
    
        // if (!mobile) {
            return oauthURL + "?clientId=2020080382407708895253&scopes=DEFAULT_BASIC_PROFILE,QUERY_BALANCE,CASHIER,MINI_DANA&requestId=" + uuidv4() + "&state="+ uuidv4() + "&terminalType=SYSTEM&redirectUrl=" + callbackUrl;
        // } else {
        
            // const seamlessData = encodeURI(JSON.stringify({
            //     "mobile": input.phone,
            //     "verifiedTime": moment(expiring(1)).format(),
            //     "externalUid": uuidv4(), //input.invoice,
            //     "reqTime": reqTime,
            //     "reqMsgId": uuidv4()
            // }))

            // console.log('seamles', seamlessData)
            // // const signature = toSignature(seamlessData)

            // const seamlessSign = encodeURI(toSignature(seamlessData))

            // const isValid = verify(seamlessData, toSignature(seamlessData))

            // if(!isValid){
            //     throw new BadRequestException('signature not valid')
            // }
            
            // oauthURL += '?state=40bc6112-f438-4578-8b03-00af23923bb4'
            // oauthURL += "?clientId=" + danaKey.clientId
            // oauthURL += "&scopes=QUERY_BALANCE,DEFAULT_BASIC_PROFILE,MINI_DANA"
            // // oauthURL += "&requestId=" + randomIn(64).toString()
            // // oauthURL += "&terminalType=SYSTEM"
            // oauthURL += "&redirectUrl=" + callbackUrl
            // oauthURL += "&seamlessData=" + seamlessData
            // oauthURL += "&seamlessSign=" + seamlessSign
            // oauthURL += "&lang=id"
            // return oauthURL
        // }

    }
    
    async applyToken(userID: any, auth_code:string): Promise<any> {
        const sign = {
            "head": this.danaHead('dana.oauth.auth.applyToken', uuidv4()),
            "body": {
                "grantType": "AUTHORIZATION_CODE",
            	"authCode": auth_code
            }
        }

        const signature = toSignature(sign)
        const isValid = verify(sign, signature)

        if(!isValid){
            throw new BadRequestException('signature not valid')
        }
        
        const data = {
            'request': sign,
            'signature': signature
        }

        const url = baseUrl + "/dana/oauth/auth/applyToken.htm"

        var tokenization = await this.tokenModel.findOne({userId: userID})
        
        try {
            const dana = await this.http.post(url, data, headerConfig).pipe(map(response => response.data)).toPromise()

            if(!tokenization){
                tokenization = new this.tokenModel({
                    name: "DANA",
                    user: userID
                })
            }
            
            tokenization.token = dana["response"]["body"]["accessTokenInfo"]["accessToken"],
            tokenization.expired_date = dana["response"]["body"]["accessTokenInfo"]["expiresIn"]

            await tokenization.save()
            
            return {
                token: tokenization.token,
                dana: dana
            }
        } catch (error) {
            throw new BadGatewayException("auth_code expired")
        }
    }
    
    async userDana(access_token: string) {
        var head:any = this.danaHead('dana.member.query.queryUserProfile', uuidv4())
        head.accessToken = access_token

        const sign = {
            "head": head,
            "body":{
                'userResources': [ "BALANCE", "TRANSACTION_URL", "MASK_DANA_ID", 
                "TOPUP_URL", "OTT" ]
            }
        }
        
        const signature = toSignature(sign)
        const isValid = verify(sign, signature)

        if(!isValid){
            throw new BadRequestException('signature not valid')
        }
        
        const data = {
            'request': sign,
            'signature': signature
        }

        const url = baseUrl + "/dana/member/query/queryUserProfile.htm"
        
        const dana = await this.http.post(url, data, headerConfig).pipe(map(response => response.data)).toPromise()

        return dana
    }

    async order(input: any){
        const callback = {
            finish: process.env.DANA_CALLBACK_FINISH + '?id=' + input.order_id + '&exd=' + input.invoice_number,
            notif: process.env.DANA_CALLBACK_NOTIF + '?id=' + input.order_id + '&exd=' + input.invoice_number
        }
        
        const sign = {
            "head": this.danaHead('dana.acquiring.order.createOrder', input.invoice_number),
            "body":{
                "order":{                
                    "orderTitle":`Laruno Order`, // M
                    "orderAmount": {                        // M
                        "currency":"IDR",                   // M
                        "value": input.total_price + '00'  // M
                    },
                    "merchantTransId": randomIn(12).toString(),
                    "createdTime":  reqTime,
                    "expiryTime": moment(expiring(2)).format(),
                },
                "merchantId": danaKey.merchandId,
                "productCode": "51051000100000000001", // always set to 51051000100000000001
                "envInfo":{
                    "sourcePlatform":"IPG",
                    "terminalType":"SYSTEM",
                },
                "notificationUrls":[
                    {
                        "url": callback.finish,
                        "type":"PAY_RETURN"
                    },
                    {
                        "url": callback.notif,
                        "type":"NOTIFICATION"
                    }
                ]
            }
        }
        
        const signature = toSignature(sign)
        const isValid = verify(sign, signature)

        if(!isValid){
            throw new BadRequestException('signature not valid')
        }
        
        const data = {
            'request': sign,
            'signature': signature
        }

        const url = baseUrl + "/dana/acquiring/order/createOrder.htm" // "dana/acquiring/order/agreement/pay.htm"
        
        
        try {
            const dana = await this.http.post(url, data, headerConfig).pipe(map(response => response.data)).toPromise()
    
            if(dana.response.body.resultInfo.resultCode !== 'SUCCESS'){
                throw new BadRequestException(dana.response.body.resultInfo.resultMsg)
            }
    
            const { merchantTransId, acquirementId, checkoutUrl } = dana.response.body
            
            let danaOrder = new this.danaModel({
                merchant_trans_id: merchantTransId,
                acquirement_id: acquirementId,
                invoice_number: input.invoice_number,
                checkout_url: checkoutUrl,
                user_id: input.user_id,
                total_price: input.total_price
            })

            await danaOrder.save()
            
            delete dana.response.body.resultInfo
            return dana.response.body
        } catch (error) {
            throw new NotImplementedException("Can't save order of dana")
        }
    }

    async capture(input: any) {
        const sign = {
            "head": this.danaHead('dana.acquiring.order.capture', input.invoice_number),       
            "body":{
                "merchantId": danaKey.merchandId,
                // "captureId": "20150312345631443334090948"
                "acquirementId": "20210118111212800110166764236304601",
                "requestId": "78995834555912716937078453078115",
                "captureAmount": {
                    "currency": "IDR",
                    "nilai": input.total_price
                },
            }
        }

        const signature = toSignature(sign)
        const isValid = verify(sign, signature)

        if(!isValid){
            throw new BadRequestException('signature not valid')
        }
        
        const data = {
            'request': sign,
            'signature': signature
        }

        const url = baseUrl + "/dana/acquiring/order/capture.htm"
        
        const dana = await this.http.post(url, data, headerConfig).pipe(map(response => response.data)).toPromise()
        console.log('dana', dana)
        if(dana.response.body.resultInfo.resultCode !== 'SUCCESS'){
            throw new BadRequestException(dana.response.body.resultInfo.resultMsg)
        }

        delete dana.response.body.resultInfo
        return dana.response.body
    }

    async acquiringSeamless(input: any){ 
        const callback = {
            finish: process.env.CLIENT + '/oauth/callback',
            notif: process.env.CLIENT + '/oauth/callback'
        }

        const sign = {
            "head": this.danaHead('dana.acquiring.order.agreement.pay', input.invoice_number),
            "body":{
                "order":{                
                    "orderTitle": 'Laruno-Order-' + Date.now(), // M
                    "orderAmount": {                    // M
                        "currency":"IDR",               // M
                        "value": input.total_price      // M
                    },
                    "merchantTransId": randomIn(12).toString(),
                    "createdTime":  reqTime,
                    "expiryTime": moment(expiring(2)).format(),
                },

                "merchantId": danaKey.merchandId,
                "productCode": "51051000100000000031",
                "envInfo":{
                    "sourcePlatform":"IPG",
                    "terminalType":"SYSTEM",
                },
                "notificationUrls":[
                    {
                        "url": callback.finish,
                        "type":"PAY_RETURN"
                    },
                    {
                        "url": callback.notif,
                        "type":"NOTIFICATION"
                    }
                ]
            }
        }
        
        const signature = toSignature(sign)
        const isValid = verify(sign, signature)

        if(!isValid){
            throw new BadRequestException('signature not valid')
        }
        
        const data = {
            'request': sign,
            'signature': signature
        }

        const url = baseUrl + "/dana/member/query/queryUserProfile.htm" // "dana/acquiring/order/agreement/pay.htm"
        
        const dana = await this.http.post(url, data, headerConfig).pipe(map(response => response.data)).toPromise()
        console.log('dana', dana)

        if(dana.response.body.resultInfo.resultCode !== 'SUCCESS'){
            throw new BadRequestException(dana.response.body.resultInfo.resultMsg)
        }

        delete dana.response.body.resultInfo
        return dana.response.body
    }

    async finishNotify(input: any) {
        // console.log("input", input)
        const sign = {
            "head": this.danaHead('dana.acquiring.order.finishNotify', input.invoice_number),
            "body":{
                "acquirementId": input.acquirement_id,
                "merchantTransId": input.merchant_trans_id,
                "finishedTime": reqTime,
                "createdTime": reqTime,
                "merchantId": danaKey.merchandId,
                "orderAmount": {                    // M
                    "currency":"IDR",               // M
                    "value": input.total_price + '00' // M
                },
                "acquirementStatus":"SUCCESS", // input
            
                "paymentView": {
                    "payRequestExtendInfo":"{\"key\":\"value\"}",
                    "extendInfo":"{\"topupAndPay\":\"false\", \"paymentStatus\":\"SUCCESS\"}"
                },
                "extendInfo":"{\"key\": \"value\"}"
            }
        }
        
        const signature = toSignature(sign)
        const isValid = verify(sign, signature)

        if(!isValid){
            throw new BadRequestException('signature not valid')
        }
        
        const data = {
            'request': sign,
            'signature': signature
        }

        console.log('sign', sign)
        // const url = "https://laruno.id/payments/notification" // "dana/acquiring/order/agreement/pay.htm"
        const url = "https://879e18a7b826.ngrok.io/payments/finish"
        const dana = await this.http.post(url, data, headerConfig).pipe(map(response => response.data)).toPromise()

        console.log('dana', dana)
        // console.log('dana-response', dana.response)
        
        return dana
        // if(dana.response.body.resultInfo.resultCode !== 'SUCCESS'){
        //     throw new BadRequestException(dana.response.body.resultInfo.resultMsg)
        // }

        // delete dana.response.body.resultInfo
        // return dana.response.body
    }

    async orderFinish(input: any) {
        console.log('input', input)
        const sign = {
            "head": this.danaHead('/dana.acquiring.order.captureNotify', input.invoice_number),
            "body":{
                "acquirementId": "2015032412007101547201352747",
                "finishedTime": reqTime,
                "createdTime": reqTime,
                "merchantId": danaKey.merchandId,

                "merchantTransId":"201505080001",
                "captureId":"2015032412003101547201352747",
                "captureRequestId":"78995834555912716937078453078115",

                "orderAmount": {                    // M
                    "currency":"IDR",               // M
                    "value": input.total_price      // M
                },
                "capturedTime": reqTime,
                "resultInfo":{
                    "resultStatus":"S",
                    "resultCodeId":"00000000",
                    "resultCode":"SUCCESS",
                    "resultMsg":"success"
                }
            }
        }
        
        const signature = toSignature(sign)
        const isValid = verify(sign, signature)

        if(!isValid){
            throw new BadRequestException('signature not valid')
        }
        
        const data = {
            'request': sign,
            'signature': signature
        }

        return data
    }

    async acquiringOrder(input: any) {
        const sign = {
            "head": this.danaHead('dana.acquiring.order.query', uuidv4()),       
            "body":{
                "merchantId": danaKey.merchandId,
                "acquirementId": "20210319111212800110166612139659874",
                "merchantTransId": "429218547166"
            }
        }

        const signature = toSignature(sign)
        const isValid = verify(sign, signature)

        if(!isValid){
            throw new BadRequestException('signature not valid')
        }
        
        const data = {
            'request': sign,
            'signature': signature
        }

        const url = baseUrl + "/dana/acquiring/order/query.htm"
        
        const dana = await this.http.post(url, data, headerConfig).pipe(map(response => response.data)).toPromise()
        return dana
    }

    async acquiringAgreementPay(input: any) {
        const callback = {
            finish: process.env.DANA_CALLBACK_FINISH,
            notif: process.env.DANA_CALLBACK_NOTIF
        }

        const sign = {
            "head": this.danaHead('dana.acquiring.order.agreement.pay', input.invoice_number),       
            "body":{
                "order":{                
                    "orderTitle":"Order Dummy Salasa",
                    "orderAmount":{
                        "currency":"IDR",
                        "value": input.total_price
                    },
                    "merchantTransId": randomIn(12).toString()
                },
                "merchantId": danaKey.merchandId,
                "productCode":"51051000100000000031",
                "envInfo":{
                    "sourcePlatform":"IPG"
                },
                "notificationUrls":[
                    {
                        "url": callback.finish,
                        "type":"PAY_RETURN"
                    },
                    {
                        "url": callback.notif,
                        "type":"NOTIFICATION"
                    }
                ]
            }
        }

        const signature = toSignature(sign)
        const isValid = verify(sign, signature)

        if(!isValid){
            throw new BadRequestException('signature not valid')
        }
        
        const data = {
            'request': sign,
            'signature': signature
        }

        const url = baseUrl + "/dana/acquiring/order/agreement/pay.htm"
        
        const dana = await this.http.post(url, data, headerConfig).pipe(map(response => response.data)).toPromise()
        return dana
    }

    async callback(payment: any){
        return 'Indonesian funds are not ready '
        //console.log('payment', payment)
        // const { invoice_number, pay_uid } = payment
        
        // const url = baseUrl + "/dana/acquiring/order/agreement/pay.htm"
        // try{
        //     const getPayout = await this.http.get(url, headerConfig).toPromise()
        //     return getPayout.data.status
        // }catch(err){
        //     const e = err.response
        //     if(e.status === 404){
        //         throw new NotFoundException(e.data.message)
        //     }else if(e.status === 400){
        //         throw new BadRequestException(e.data.message)
        //     }else{
        //         throw new InternalServerErrorException
        //     }
        // }
    }

    async finishNotifyCheck(input: any) {
        console.log("input", input)

        if(!input.head.reqTime) input.head.reqTime = "2021-03-24T19:23:15.802+00:00";
        if(!input.head.reqMsgId) input.head.reqMsgId = "25321SKU3613090";

        if(!input.body.acquirementId) input.body.acquirementId = "20210325111212800110166400739921087";
        if(!input.body.merchantTransId) input.body.merchantTransId = "917890889074";
        if(!input.body.finishedTime) input.body.finishedTime = "2021-03-24T19:23:15.802+00:00";
        if(!input.body.createdTime) input.body.createdTime = "2021-03-24T19:23:15.802+00:00";
        if(!input.body.orderAmount.value) input.body.orderAmount.value = "5000";
        
        const signature = toSignature(input)
        const isValid = verify(input, signature)

        if(!isValid){
            throw new BadRequestException('signature not valid')
        }
        
        const data = {
            'request': input,
            'signature': signature
        }

        return data
    }
}