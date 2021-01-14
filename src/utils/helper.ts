import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { expiring } from './order';

// const hasher = crypto.createHash('sha256');
const privatePath = path.resolve('src/cert', 'rsa_private_dana_prod.pem')
const privateKey = fs.readFileSync(privatePath).toString('utf8')

const publicPath = path.resolve('src/cert', 'rsa_public_dana_prod.pem')
const publicKey = fs.readFileSync(publicPath).toString('utf8')

export const toSignature = (data) => {
    const sign = crypto.createSign('sha256')
    sign.write(JSON.stringify(data))
    sign.end()
    const signature = sign.sign(privateKey, 'base64') //.toString('base64') // or 'hex'
    return signature
}

export const verify = (data, signature) => {
    const verify = crypto.createVerify('RSA-SHA256');
    verify.write(JSON.stringify(data));
    verify.end();
    // const verified = verify.verify(publicKey, signature, 'hex')
    const verified = verify.verify(publicKey, signature, 'base64')
    return verified
}

export const dateFormat = (date) => {
    return date.toISOString()
    .replace(/T/, '-')      // replace T with a space
    .replace(/\..+/, '')     // delete the dot and everything after
}

export const createOrder = (data) => {
    const now = new Date()
    const sign = {
        'head': {
            'version': '2.0',
            "function": "dana.acquiring.order.createOrder",
            "reqTime": now,
            "clientId": "2020032642169039682633",
            "reqMsgId": `INV-${dateFormat(now)}-orderID`, //"INV-".date('Y-m-d')."-".date('H-i-s')."-".$order->id,
            "clientSecret": "be555206838b4f9f9d6baae30e21fd2e",
            "reserve": "{ \"attr1\":\"val1\" }",
            'accessToken': data.token
        },
        'body': {
            'order': {
                "orderTitle": `Laruno-${data.user.name}`,
                'orderAmount': {
                    "currency": "IDR",
                    "value": data.order.total_price.toString() // total price
                },
                "merchantTransId": `INV-${dateFormat(now)}-orderID`,
                "merchantTransType": "MEMBERSHIP",
                "orderMemo": "-",
                "createdTime": now,
                "expiryTime": expiring(1)
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
                    "url": data.url.finish, //route('payment.finish'),
                    "type": "PAY_RETURN"
                },
                {
                    "url": data.url.notif, //route('payment.notif'),
                    "type": "NOTIFICATION"
                }
            ]
        }
    }

    return {
        data: { request: sign},
        sign: sign
    }
}

export const getBeetwenDay = (firstDate: Date, secondDate: Date) => {
    // time difference
    const timeDiff = Math.abs(secondDate.getTime() - firstDate.getTime());

    // days difference
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

export const nextHours = (date: Date, hour: number) => {
    return {
        hour: Number(date.getUTCHours()) + hour,
        minute: date.getMinutes()
    }
}

export const randomIn = (length) => {
    return Math.floor(Math.pow(10, length-1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length-1) - 1));
}

// Currency Format to Indonesia
export const currencyFormat = (price) => {
    return price.toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    });
}

export const fibonacci = (next: number, length: number, start?: number) => {
    if(!start){
        start = 1
    }
    const first = start

    var arr = new Array()
    for (let i = 0; i < length; i++) {
        arr[i] = (start *= next)
    }
    
    arr.unshift(first)
    arr.pop()
    return arr
}

export const isCallerMobile = (req) => {
    var ua = req.headers['user-agent'].toLowerCase(),
      isMobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0, 4));
  
    return !!isMobile;
  }