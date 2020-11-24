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
