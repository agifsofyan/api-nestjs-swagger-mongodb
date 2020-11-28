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

export const UrlValidation = (str) => {
	let urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/

	return urlRegex.test(str)
}

export const productValid = (check) => {
	const { type, webinar, ecommerce, price, sale_price } = check
	
	/** Start Type Product Condition */
	if(type && type === 'webinar'){
		if(!webinar){
			throw new BadRequestException('value object (date, start_time, duration & client_url) in webinar is required')
		}

		if(!webinar.date){
			throw new BadRequestException('webinar date is required')
		}

		if(webinar.date && DecimalValidation(webinar.date)){
			throw new BadRequestException('webinar date must be date type or string')
		}

		if(!webinar.start_time){
			throw new BadRequestException('webinar start_time is required')
		}

		if(webinar.start_time && !TimeValidation(webinar.start_time)){
			throw new BadRequestException('webinar start_time, wrong format, ex: 10:30')
		}

		if(!webinar.duration){
			throw new BadRequestException('webinar duration is required')
		}

		if(webinar.duration && !TimeValidation(webinar.duration)){
			throw new BadRequestException('webinar duration, wrong format, ex: 30:00')
		}

		if(!webinar.client_url){
			throw new BadRequestException('webinar client_url is required')
		}

		if(webinar.client_url && !UrlValidation(webinar.client_url)){
			throw new BadRequestException('webinar client_url, wrong format, ex: http://www.client_url.com')
		}
		
		return 'webinar'
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
