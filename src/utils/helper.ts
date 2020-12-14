import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { expiring } from './StringManipulation';

// const hasher = crypto.createHash('sha256');
const privatePath = path.resolve('src/cert', 'rsa_private_dana_sandbox.pem')
const privateKey = fs.readFileSync(privatePath).toString('ascii')

const publicPath = path.resolve('src/cert', 'rsa_private_dana_sandbox.pem')
const publicKey = fs.readFileSync(publicPath).toString('ascii')

let signer = crypto.createSign('RSA-SHA256')
let verifier = crypto.createVerify('RSA-SHA256')

export const signature = (data) => {
    signer.update(data.toString())
    return signer.sign(privateKey, 'base64')
}

export const verify = (data, signer) => {
    verifier.update(data.toString())
    return verifier.verify(publicKey, signer, 'base64');
}

const dateFormat = (date) => {
    return date.toISOString()
    .replace(/T/, '-')      // replace T with a space
    .replace(/\..+/, '')     // delete the dot and everything after
}

const now = new Date()

export const createOrder = () => {
    const token = '1eAASK6PCMirBy1SKcSpFNnxSeScQEXBK2BJqZI8itgeUFB0hbCDpPXz74/HQqmmhCrjBYrYzTyt1bzLFtZbaWDmYcoI/8IiaQt4qtnEBk/UWWML0iuiftD23kcmfFnV0Xiw8DL1aYoqkh4XH/etB0KMyqyp36I4FnT/2U87JY/8mLFUEsd5rXf8Wd0xHzkaR0MIEKZiHNRLIPgZp14dtFlgnN1dbLX/37UIkR1BpRj7G7PcsMs60R+DdroCgTdtyKSo/L7M7Y5mUmbQvnXtXD+FkZWEopkmytuFGoiMQCcn0Vt7rJV9zMhGSrhZrqdrAFgAvJCWXFFGsouqTrlbgQ=='

    const sign = {
        'head': {
            'version': '2.0',
            "function": "dana.acquiring.order.createOrder",
            "reqTime": now,
            "clientId": "2020032642169039682633",
            "reqMsgId": `INV-${dateFormat(now)}-orderID`, //"INV-".date('Y-m-d')."-".date('H-i-s')."-".$order->id,
            "clientSecret": "be555206838b4f9f9d6baae30e21fd2e",
            "reserve": "{ \"attr1\":\"val1\" }",
            'accessToken': token
        },
        'body': {
            'order': {
                "orderTitle": 'productName', // $product->product_name,
                'orderAmount': {
                    "currency": "IDR",
                    "value": 120, // $price

                },
                "merchantTransId": `INV-${dateFormat(now)}-orderID`, //"INV-".date('Y-m-d')."-".date('H-i-s')."-".$order->id,
                "merchantTransType": "MEMBERSHIP",
                "orderMemo": "-",
                "createdTime": now,
                "expiryTime": expiring(1), //date(DATE_RFC3339, strtotime('+1 hours')),
                'goods': [
                    {
                        "merchantGoodsId": "24525635625623",
                        "description": 'productName', // $product->product_name,
                        "category": "membership",
                        'price': {
                            "currency": "IDR",
                            "value": 130, // $price

                        },
                        'unit': 'Kg',
                        "quantity": "1",
                    }
                ]
            },
            "merchantId": "216620000091804392159",
            "productCode": "51051000100000000001",
            'envInfo': {
                "sourcePlatform": "IPG",
                "terminalType": "WEB",
                "orderTerminalType": "WEB",
            },
            "notificationUrls": [
                {
                    "url": 'url_PAY_RETURN', //route('payment.finish'),
                    "type": "PAY_RETURN"
                },
                {
                    "url": 'url_notif', //route('payment.notif'),
                    "type": "NOTIFICATION"
                }
            ]
        }
    }

    const checkSign = signature(sign)

    const data = {
        'request': {
            'head': {
                'version': '2.0',
                "function": "dana.acquiring.order.createOrder",
                "reqTime": new Date(),
                "clientId": "2020032642169039682633",
                "reqMsgId": `INV-${dateFormat(now)}-orderID`, //"INV-" + now.toISOString('Y-m-d')."-".date('H-i-s')."-".$order->id,
                "clientSecret": "be555206838b4f9f9d6baae30e21fd2e",
                "reserve": "{ \"attr1\":\"val1\" }",
                'accessToken': token
            },
            'body': {
                'order': {
                    "orderTitle": 'productName', //$product->product_name,
                    'orderAmount': {
                        "currency": "IDR",
                        "value": 100 //$price
                    },
                    "merchantTransId": `INV-${dateFormat(now)}-orderID`, //"INV-".date('Y-m-d')."-".date('H-i-s')."-".$order->id,
                    "merchantTransType": "MEMBERSHIP",
                    "orderMemo": "-",
                    "createdTime": now,
                    "expiryTime": expiring(1),
                    'goods': [
                        {
                            "merchantGoodsId": "24525635625623",
                            "description": 'productName', //$product->product_name,
                            "category": "membership",
                            'price': {
                                "currency": "IDR",
                                "value": 110, // $price
                            },
                            'unit': 'Kg',
                            "quantity": "1",
                        }
                    ]
                },
                "merchantId": "216620000091804392159",
                "productCode": "51051000100000000001",
                'envInfo': {
                    "sourcePlatform": "IPG",
                    "terminalType": "WEB",
                    "orderTerminalType": "WEB",
                },
                "notificationUrls": [
                    {
                        "url": 'url_payment_return', //route('payment.finish'),
                        "type": "PAY_RETURN"
                    },
                    {
                        "url": 'url_notif', //route('payment.notif'),
                        "type": "NOTIFICATION"
                    }
                ],
            },
        },
        "signature": checkSign
    }

    return data
}