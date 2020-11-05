import * as moment from 'moment';

export class OptQuery {
	offset?: number;
	limit?: number;	
	fields?: string;	
	value?: string;	
	sortby?: string;	
	sortval?: string;

	optFields?: string; // Optional Param
	optVal?: string; // optional Param
}

export const ObjToString = (object) => {
	var str = '';
	for (var k in object) {
	  if (object.hasOwnProperty(k)) {
		str += k + '=' + object[k] + '&';
	  }
	}
	//console.log(str);
	return str;
}

export const RandomStr = (int) => {
	return (Math.random().toString(36).substring(int)).toUpperCase();
}

export const StrToUnix = (str) => {
	return moment(str).unix();
}

export const UnixToStr = (unix) => {
	return moment(unix).toDate()
}