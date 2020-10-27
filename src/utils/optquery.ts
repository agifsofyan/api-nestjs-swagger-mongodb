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