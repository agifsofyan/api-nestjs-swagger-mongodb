import { BadRequestException, HttpService, Injectable, NotImplementedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { isCallerMobile, toSignature, verify, dateFormat, createOrder, rfc3339, randomIn, uuidv4 } from "src/utils/helper";
import { expiring } from "src/utils/order";
import { RandomStr } from "src/utils/StringManipulation";
import { IToken } from "../token/interfaces/token.interface";
import * as readline from "readline";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { AxiosResponse } from "axios";

const baseUrl = "https://api.saas.dana.id";
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

const now = new Date()

@Injectable()
export class DanaService {
    constructor(
        private http: HttpService,
        @InjectModel("Token") private readonly tokenModel: Model<IToken>,
    ) { }

    private danaHead(func: string) {
        return {
            "version": "2.0",
            "function": func,
            "clientId": danaKey.clientId,
            "reqTime": rfc3339(now),
            "reqMsgId": `INV-${dateFormat(now)}-orderID`,
            "clientSecret": danaKey.clientSecret,
            "reserve":"{}"
        }
    }
    
    async danarequest(req: any, input: any) {
        // const mobile = isCallerMobile(req)

        // let csrf = RandomStr(30)
        var oauthURL = 'https://m.dana.id/m/portal/oauth'
        const callbackUrl = "https://laruno.id/oauth/callback"
    
        // if (!mobile) {
        //     return "https://m.dana.id/m/portal/oauth?clientId=2020080382407708895253&scopes=DEFAULT_BASIC_PROFILE,QUERY_BALANCE,CASHIER,MINI_DANA&requestId=" + csrf + "&state="+ csrf + "&terminalType=SYSTEM&redirectUrl=" + callbackUrl;

        //     // return "https://m.dana.id/m/portal/oauth?clientId=2019100125982472297673&scopes=DEFAULT_BASIC_PROFILE,AGREEMENT_PAY,QUERY_BALANCE,CASHIER,MINI_DANA&requestId=1234567&state=1234567&terminalType=SYSTEM&redirectUrl=http://dev.laruno.com/payments/callback"
        // } else {
    
        const seamlessData = {
            "mobile": input.phone,
            "verifiedTime": rfc3339(now),
            "externalUid": uuidv4(), //input.invoice,
            "reqTime": rfc3339(now),
            "reqMsgId": "12345678"
        }
        console.log('seamles', seamlessData)
        const signature = toSignature(seamlessData)

        const seamlessSign = encodeURI(signature)

        const isValid = verify(seamlessData, signature)

        if(!isValid){
            throw new BadRequestException('signature not valid')
        }
        
        oauthURL += '?state=2345555'
        oauthURL += "&clientId=" + danaKey.clientId
        oauthURL += "&scopes=QUERY_BALANCE,MINI_DANA,CASHIER"
        oauthURL += "&requestId=" + randomIn(64).toString()
        oauthURL += "&terminalType=WEB"
        oauthURL += "&redirectUrl=" + callbackUrl
        oauthURL += "&seamlessData=" + encodeURI(JSON.stringify(seamlessData))
        oauthURL += "&seamlessSign=" + seamlessSign
        oauthURL += "&lang=id"

        console.log('oauthURL', oauthURL)

        return oauthURL
    }

    
    async applyToken(input: any): Promise<any> {
        const sign = {
            "head": this.danaHead('dana.oauth.auth.applyToken'),
            "body": {
                "grantType": "AUTHORIZATION_CODE",
            	"authCode": `${input.authCode}`
            },
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
        
        // try {
            const dana = await this.http.post(url, data, headerConfig).pipe(map(response => response.data)).toPromise()
            
            // console.log("dana", dana)
            return dana
            // const tokenization = new this.tokenModel({
            //     name: "DANA",
            //     userId: input.userId,
            //     token: dana["response"]["body"]["accessTokenInfo"]["accessToken"],
            //     expired_date: dana["response"]["body"]["accessTokenInfo"]["expiresIn"]
            // })

            // tokenization.save()

            // return {
            //     token: tokenization.token,
            //     dana: dana
            // }
        // } catch (error) {
        //     throw new NotImplementedException()
        // }
    }

    async order(input: any){
        const callback = {
            finish: process.env.CLIENT + '/oauth/callback',
            notif: process.env.CLIENT + '/oauth/callback'
        }
        
        const sign = {
            "head": this.danaHead('dana.acquiring.order.createOrder'),
            "body":{
                "order":{                
                    "orderTitle":`Laruno-Order-${now}`, // M
                    "orderAmount": {                    // M
                        "currency":"IDR",               // M
                        "value": input.total_price      // M
                    },
                    "merchantTransId": randomIn(12).toString(),
                    "createdTime":  rfc3339(now),
                    "expiryTime": rfc3339(expiring(2)),
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
        
        const dana = await this.http.post(url, data, headerConfig).pipe(map(response => response.data)).toPromise()
        
        if(dana.response.body.resultInfo.resultCode !== 'SUCCESS'){
            throw new BadRequestException(dana.response.body.resultInfo.resultMsg)
        }

        delete dana.response.body.resultInfo
        return dana.response.body
    }

    async capture(input: any) {
        const sign = {
            "head": this.danaHead('dana.acquiring.order.capture'),       
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

        const url = baseUrl + "/dana/acquiring/order/query.htm"
        
        const dana = await this.http.post(url, data, headerConfig).pipe(map(response => response.data)).toPromise()
        console.log('dana', dana)
        return dana
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
            "head": this.danaHead('dana.acquiring.order.agreement.pay'),
            "body":{
                "order":{                
                    "orderTitle":`Laruno-Order-${now}`, // M
                    "orderAmount": {                    // M
                        "currency":"IDR",               // M
                        "value": input.total_price      // M
                    },
                    "merchantTransId": randomIn(12).toString(),
                    "createdTime":  rfc3339(now),
                    "expiryTime": rfc3339(expiring(2)),
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

        return dana
        if(dana.response.body.resultInfo.resultCode !== 'SUCCESS'){
            throw new BadRequestException(dana.response.body.resultInfo.resultMsg)
        }

        delete dana.response.body.resultInfo
        return dana.response.body
    }

    async userDana() {
        const sign = {
            "head": this.danaHead('dana.member.query.queryUserProfile'),
            "body":{
                'userResources': [ 'BALANCE', 'TOPUP_URL', 'OTT' ]
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

        const url = baseUrl + "/dana/acquiring/order/agreement/pay.htm" // "dana/acquiring/order/agreement/pay.htm"
        
        const dana = await this.http.post(url, data, headerConfig).pipe(map(response => response.data)).toPromise()
        console.log('dana', dana)

        return dana
    }
}