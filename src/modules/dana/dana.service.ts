import { HttpService, Injectable, NotImplementedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { isCallerMobile, toSignature, verify, dateFormat, createOrder } from "src/utils/helper";
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
    
    async danarequest(req: any, input: any) {
        // const user = Sentinel::getUser();
        // const agent = req.get("user-agent")
        const mobile = isCallerMobile(req)

        let csrf = RandomStr(30)
        const callbackUrl = "https://laruno.id/oauth/callback"
    
        if (!mobile) {
            return "https://m.dana.id/m/portal/oauth?clientId=2020080382407708895253&scopes=DEFAULT_BASIC_PROFILE,QUERY_BALANCE,CASHIER,MINI_DANA&requestId=" + csrf + "&state="+ csrf + "&terminalType=SYSTEM&redirectUrl=" + callbackUrl;

            // return "https://m.dana.id/m/portal/oauth?clientId=2019100125982472297673&scopes=DEFAULT_BASIC_PROFILE,AGREEMENT_PAY,QUERY_BALANCE,CASHIER,MINI_DANA&requestId=1234567&state=1234567&terminalType=SYSTEM&redirectUrl=http://dev.laruno.com/payments/callback"
        } else {
    
            const dataUser = {
                "mobile": input.phone,
                "verifiedTime": expiring(1),
                "externalUid": "TIXxxxxxUID", // input.email,
                "reqTime": now,
                "reqMsgId": input.phone + "token"
            }

            const signature = toSignature(dataUser)

            const isValid = verify(dataUser, signature)

            if(isValid){
                var requestUrl = "https://m.dana.id/m/portal/oauth?"
                requestUrl += "&clientId=2020032642169039682633"
                requestUrl += "state=" + ((Math.random() * 100000000) + 1)
                requestUrl += "&scopes=DEFAULT_BASIC_PROFILE,QUERY_BALANCE,CASHIER,MINI_DANA"
                requestUrl += "&requestId=12345678"
                requestUrl += "&terminalType=SYSTEM"
                requestUrl += "&redirectUrl=" + callbackUrl
                requestUrl += "&seamlessData=" + encodeURI(JSON.stringify(dataUser))
                requestUrl += "&seamlessSign=" + encodeURI(signature)
    
                return requestUrl
            }

            return "redirect to /me"
        }

        // const dataUser = {
        //     "mobile": input.phone,
        //     "verifiedTime": expiring(1),
        //     "externalUid": input.email,
        //     "reqTime": now,
        //     "reqMsgId": input.phone + "token"
        // }

        // const signature = toSignature(dataUser)
        // const isValid = verify(dataUser, signature)

        // var requestUrl = "https://m.dana.id/m/portal/oauth?"
        // requestUrl += "&clientId=2020032642169039682633"
        // // requestUrl += "clientId=2020080382407708895253"
        // requestUrl += "&scopes=DEFAULT_BASIC_PROFILE,QUERY_BALANCE,CASHIER,MINI_DANA"
        // requestUrl += "requestId=" + crrf
        // requestUrl += "state=" + crrf
        // requestUrl += "terminalType=SYSTEM"
        // requestUrl += "&redirectUrl=" + url
        // requestUrl += "&seamlessData=" + encodeURI(JSON.stringify(dataUser))
        // requestUrl += "&seamlessSign=" + encodeURI(signature)

        // return requestUrl
    }

    
    async applyToken(input: any): Promise<any> {
        const data:any = {
            "request": {
                "head": {
                    "version": "2.0",
                    "function": "dana.oauth.auth.applyToken",
                    "clientId": "2020080382407708895253",
                    "clientSecret": "9c105ae716d44a3a8e17b5ad0f957300",
                    "reqTime":  now,
                    "reqMsgId": "d7e736c6-be23-4141-8151-0a1c85e04d2f",
                    "reserve": "{}"
                },
                "body": {
                    "grantType": "AUTHORIZATION_CODE",
                    "authCode": `${input.authCode}`
                }
            }
        }

        const sign = {
            "head": {
                "version": "2.0",
	            "function":"dana.oauth.auth.applyToken",
	            "clientId": "2020080382407708895253",
                "clientSecret": "9c105ae716d44a3a8e17b5ad0f957300",
	            "reqTime": now,
	            "reqMsgId": "123124124124",
	            "reserve": "{}"
            }, 
            "body": {
                "grantType": "AUTHORIZATION_CODE",
            	"authCode": `${input.authCode}`
            },
        }

        console.log("sig-string", JSON.stringify(sign))

        // { 
        //     "request": { 
        //         "head": { 
        //             "version": "2.0", 
        //             "function": "dana.oauth.auth.applyToken", 
        //             "clientId": "2019012513761704237129", 
        //             "clientSecret": "03bf50da6ccb4c94b8ec4a1eb6bd2712", 
        //             " reqTime ":" 2001-07-04T12: 08: 56 + 05: 30 ", 
        //             " reqMsgId ":" d7e736c6-be23-4141-8151-0a1c85e04d2f ", 
        //             " reserve ":" {} " 
        //         }, 
        //         " body ": { 
        //             "grantType": "AUTHORIZATION_CODE", 
        //             "authCode": "4b203fe6c11548bcabd8da5bb087a83b"
        //         } 
        //     }, 
        //     "tanda tangan": "string tanda tangan" 
        // }

        const signature = toSignature(sign)
        console.log("signature", signature)

        const isValid = verify(sign, signature)

        data.signature = signature;
        data.isValid = isValid;

        // console.log("data", data)

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

        // var getToken = await this.tokenModel.findOne({name: "DANA", userId: input.userId}).then(val => val.token)

        // if(!getToken){
        //     const storeToken = await this.applyToken(input)
        //     getToken = storeToken.token
        // }

        const danaOrder = {
            url: {
                finish: process.env.CLIENT + '/oauth/callback',
                notif: process.env.CLIENT + '/oauth/callback'
            },
            order: input.order, 
            user: input.user
        }
        
        const sign = {
            "head":{
                "version": "2.0",
                "function": "dana.acquiring.order.createOrder",
                "clientId": danaKey.clientId,
                "reqTime": "2021-01-15T15:04:56-07:00",
                "reqMsgId": `INV-${dateFormat(now)}-orderID`,
                "clientSecret": danaKey.clientSecret,
                "reserve":"{}"
            },       
            "body":{
                "order":{                
                    "orderTitle":"Dummy product",
                    "orderAmount":{
                        "currency":"IDR",
                        "value": `${danaOrder.order.total_price}`
                    },
                    "merchantTransId":"201505080001",
                    "merchantTransType":"dummy transaction type",
                    "orderMemo":"Memo",
                    "createdTime": "2021-01-15T15:04:56-07:00",
                    "expiryTime": "2021-01-16T15:04:56-07:00",
                    "goods":[
                        {
                            "merchantGoodsId":"24525635625623",
                            "description":"dummy description",
                            "category":"dummy category",
                            "price":{
                                "currency":"IDR",
                                "value": `${danaOrder.order.total_price}`
                            },
                            "unit":"Kg",
                            "quantity":"1",
                            "merchantShippingId":"564314314574327545",
                            "snapshotUrl":"[http://snap.url.com]",
                            "extendInfo":"{\"somekey\":\"somevalue\"}"
                        }  
                    ],
                    "shippingInfo":[
                        {
                            "merchantShippingId":"564314314574327545",
                            "trackingNo":"646431431322332133",
                            "carrier":"Federal Express",
                            "chargeAmount":{
                                "currency":"IDR",
                                "value": `${danaOrder.order.total_price}`
                            },
                            "countryName":"JP",
                            "stateName":"GA",
                            "cityName":"Atlanta",
                            "areaName":"Rd",
                            "address1":"137 W San Bernardino",
                            "address2":"4114 Sepulveda",
                            "firstName":"Jim",
                            "lastName":"Li",
                            "mobileNo":"13765443223",
                            "phoneNo":"2423-2322342",
                            "zipCode":"310001",
                            "email":"abc@gmail.com",
                            "faxNo":"2123-11113"
                        }
                    ]
                },
                "merchantId": danaKey.merchandId,
                "subMerchantId": `${RandomStr(32)}`,
                "mcc":"5732",
                "productCode":"51051000100000000001",
                "envInfo":{
                    "sessionId":"8EU6mLl5mUpUBgyRFT4v7DjfQ3fcauthcenter",
                    "tokenId":"a8d359d6-ca3d-4048-9295-bbea5f6715a6",
                    "websiteLanguage":"en_US",
                    "clientIp":"10.15.8.189",
                    "osType":"Windows.PC",
                    "appVersion":"1.0",
                    "sdkVersion":"1.0",
                    "sourcePlatform":"IPG",
                    "clientKey":"e5806b64-598d-414f-b7f7-83f9576eb6fb",
                    "orderTerminalType":"APP",
                    "terminalType":"APP",
                    "orderOsType":"IOS",
                    "merchantAppVersion":"1.0",
                    "extendInfo":"{\"deviceId\":\"CV19A56370e8a00d542\"}"
                },
                "paymentPreference":{
                    // "disabledPayMethods":"OTC^CREDIT_CARD",
                    "payOptionBills":[
                        {
                            "payOption":"BALANCE",
                            "payMethod":"VIRTUAL_ACCOUNT",
                            "transAmount":{
                                "currency":"IDR",
                                "value": `${danaOrder.order.total_price}`
                            },
                            "chargeAmount":{
                                "currency":"IDR",
                                "value": `${danaOrder.order.total_price}`
                            },
                            "payerAccountNo":"20050000000001503276",
                            "cardCacheToken":"181ss7ashu8s088a080aa88a",
                            "saveCardAfterPay":true,
                            "channelInfo":"{ \"key\" : \"value\" }",
                            "issuingCountry":"IN",
                            "assetType":"true",
                            "extendInfo":"{ \"key\" : \"value\" }"
                        }   
                    ]
                },
                "notificationUrls":[
                    {
                        "url": `${danaOrder.url.finish}`,
                        "type":"PAY_RETURN"
                    },
                    {
                        "url": `${danaOrder.url.notif}`,
                        "type":"NOTIFICATION"
                    }
                ],
                "extendInfo":""
            }
        }
        
        const signature = toSignature(sign)
        const isValid = verify(sign, signature)
        console.log('isValid', isValid)
        var data:any = sign //{ ...orderDana.data}
        
        const order = {
            'request': data,
            'signature': signature
        }

        console.log('order', order)
        // data.isValid = isValid


        const url = baseUrl + "/dana/acquiring/order/createOrder.htm" // "dana/acquiring/order/agreement/pay.htm"
        console.log('url', url)
        // try {
            const dana = await this.http.post(url, order, headerConfig).pipe(map(response => response.data)).toPromise()
            // const tokenization = new this.tokenModel({
            //     name: "DANA",
            //     userId: input.userId,
            //     token: dana["response"]["body"]["accessTokenInfo"]["accessToken"],
            //     expired_date: dana["response"]["body"]["accessTokenInfo"]["expiresIn"]
            // })

            // tokenization.save()

            return dana
        // } catch (error) {
        //     throw new NotImplementedException()
        // }
    }
}