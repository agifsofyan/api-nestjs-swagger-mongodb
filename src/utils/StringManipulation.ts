import * as moment from 'moment';

export const ReverseString = (str) => {
    let makeArray = str.split(" ")

    let container = ""

    for(let i = 0; i < makeArray.length; i++){
		if (/^([a-zA-Z]{1,})$/.test(makeArray[i]) ) {
	        container += (makeArray[i]).substr(0,1);
		}else{
			container += (makeArray[i]).substr(0, (makeArray[i]).length);
    	}
    }

    return container.toUpperCase();
}

export const Slugify = (str) => {
    return str
        .toString()                     // Cast to string
        .toLowerCase()                  // Convert the string to lowercase letters
        // .normalize('NFD')       		// The normalize() method returns the Unicode Normalization Form of a given string.
        .trim()                         // Remove whitespace from both sides of a string
        .replace(/\s+/g, '-')           // Replace spaces with -
        // .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-');        // Replace multiple - with single -
}

export const GetTimestamp = () => {
	return Math.floor(Date.now()); // in Milliseconds
	//return Math.floor(Date.now() / 1000); // Seconds 
}

export const ForceToCode = (str) => {
	var dashIndex = str.split(" ")
	var code: any

	for(let i in dashIndex){
		     
	     code += (/^([0-9]{1,})$/.test(dashIndex[i])) ? dashIndex[i] : dashIndex[i].substring(0,1)
	}

	return code.replace("undefined", "").toUpperCase()
}

export const StrToUnix = (str) => {
	return moment(str).unix();
}

export const UnixToStr = (unix) => {
  return moment(unix).format('HH:mm')
  // return moment(unix).toDate()
}

export const RandomStr = (int) => {
	return (Math.random().toString(36).substring(int)).toUpperCase();
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

export const expiring = (day) => {
    const unixTime = Math.floor(Date.now() / 1000);
    const duration = (day * 3600 * 24)
    const expired =  unixTime + duration
    return new Date(expired * 1000)
}