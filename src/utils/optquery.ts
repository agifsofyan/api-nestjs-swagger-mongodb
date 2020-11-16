import * as moment from 'moment';
import * as fs from 'fs';
import { BadRequestException, NotFoundException, NotImplementedException } from '@nestjs/common';

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

/** Start Write File */
export const WriteFile = async (filePath, data, isJson) => {
	if(isJson){
		data = JSON.stringify(data, null, 4)
	}

	try {
		await fs.promises.writeFile(filePath, data)
		return 'ok'
	} catch (error) {
		return 400
	}
}
/** End Write File */

/** Start Read File */
export const ReadFile = async (filePath, isJson) => {
	try {
		const result: any = await fs.promises.readFile(filePath, 'utf8')
		if(isJson){
			return JSON.parse(result)
		}

		return result
	}catch(error) {
		return 404
	}
  }
/** End Read File */
