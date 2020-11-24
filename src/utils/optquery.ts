import { AnyAaaaRecord } from 'dns';
import * as fs from 'fs';

export class OptQuery {
	offset?: number;
	limit?: number;	
	fields?: string;	
	value?: any;	
	sortby?: string;	
	sortval?: string;

	optFields?: string; // Optional Param
	optVal?: any; // optional Param
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
