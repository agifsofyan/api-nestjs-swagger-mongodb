import { BadRequestException } from '@nestjs/common';

export const TimeValidation = (str) => {
	let timeRegex = new RegExp('^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$');

	return timeRegex.test(str);
}

export const DecimalValidation = (str) => {
	let decimalRegex = /^[1-9]\d*(\.\d+)?$/

	return decimalRegex.test(str)
}

export const StringValidation = (str) => {
	let strRegex = /([a-zA-Z])/

	return strRegex.test(str)
}

export const checkSpace = (str) => {
	let regex = /\s/

	return regex.test(str)
}

export const UrlValidation = (str) => {
	let urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/

	return urlRegex.test(str)
}

export const productValid = (check) => {
	const { type, boe, ecommerce, price, sale_price } = check
	
	/** Start Type Product Condition */
	if(type && type === 'boe'){
		// if(!boe){
		// 	throw new BadRequestException('value object (date, start_time, duration & client_url) in boe is required')
		// }

		// if(!boe.date){
		// 	throw new BadRequestException('boe date is required')
		// }

		// if(boe.date && DecimalValidation(boe.date)){
		// 	throw new BadRequestException('boe.date must be date type or string')
		// }

		// if(!boe.start_time){
		// 	throw new BadRequestException('boe.start_time is required')
		// }

		// if(boe.start_time && !TimeValidation(boe.start_time)){
		// 	throw new BadRequestException('boe.start_time, wrong format, ex: 10:30')
		// }

		// if(!boe.duration){
		// 	throw new BadRequestException('boe.duration is required')
		// }

		// if(boe.duration && !TimeValidation(boe.duration)){
		// 	throw new BadRequestException('boe.duration, wrong format, ex: 30:00')
		// }

		// if(!boe.client_url){
		// 	throw new BadRequestException('boe.client_url is required')
		// }

		// if(boe.client_url && !UrlValidation(boe.client_url)){
		// 	throw new BadRequestException('boe.client_url, wrong format, ex: http://www.client_url.com')
		// }
		
		return 'boe'
	}

	if(type && type === 'ecommerce'){

		if(!ecommerce){
			throw new BadRequestException('value object (stock) in ecommerce is required, field ecommerce.shipping_charges & ecommerce.weight is optional')
		}

		if(ecommerce.weight && !DecimalValidation(ecommerce.weight)){
			throw new BadRequestException('ecommerce weight must be number (decimal)')
		}

		if(!ecommerce.shipping_charges){
			ecommerce.shipping_charges = false
		}

		if(ecommerce.shipping_charges != false && ecommerce.shipping_charges != true){
			throw new BadRequestException('ecommerce shipping_charges must be true or false')
		}

		if(!ecommerce.stock){
			throw new BadRequestException('ecommerce stock is required')
		}

		if(ecommerce.stock && !DecimalValidation(ecommerce.stock)){
			throw new BadRequestException('ecommerce stock must be number (decimal)')
		}
		
		return 'ecommerce'
	}

	if(type && type === 'bonus'){
		return 'bonus'
	}
	/** End Type Product Condition */

	/** Start Price and Sale Price*/
	if(price && !DecimalValidation(price)){
		throw new BadRequestException('Price must be number (decimal)')
	}

	if(sale_price){
		if(!DecimalValidation(sale_price)){
			throw new BadRequestException('Sale price must be number (decimal)')
		}

		if(Number(price) <= Number(sale_price)){
			throw new BadRequestException('the discount (sale_price) must be smaller than the regular price')
		}
	}
	/** End Price */
	
	return null
}
