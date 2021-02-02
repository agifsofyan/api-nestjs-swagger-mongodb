import * as moment from 'moment';
import * as mongoose from 'mongoose';
import { BadRequestException } from '@nestjs/common'

const ObjectId = mongoose.Types.ObjectId;

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

export const GetTimestamp = () => Math.floor(Date.now()); // in Milliseconds

export const ForceToCode = (str) => {
	var dashIndex = str.split(" ")
	var code: any

	for(let i in dashIndex){
		     
	     code += (/^([0-9]{1,})$/.test(dashIndex[i])) ? dashIndex[i] : dashIndex[i].substring(0,1)
	}

	return code.replace("undefined", "").toUpperCase()
}

export const ReCode = (str) => {
  const haveDash = str.search("-")
  if(haveDash === -1){
    return `${str}-1`
  }else{
    const dashSplit = str.split("-")
    var dashNumb = Number(dashSplit[1])
    dashNumb += 1
    const code = `${dashSplit[0]}-${dashNumb}`
    return code
  }
}

export const StrToUnix = (str) => moment(str).unix()

export const UnixToStr = (unix) => moment(unix).format('HH:mm')

export const RandomStr = (int) => (Math.random().toString(36).substring(int)).toUpperCase()

export const ObjToString = (object) => {
  var str = '';
  for (var k in object) {
    if (object.hasOwnProperty(k)) {
      str += k + '=' + object[k] + '&';
    }
  }
  return str;
}

export const ArrStrToObjectId = (array) => array.map(str => ObjectId(str))

export const arrInArr = (firstArray, secondArray) => firstArray.some(x => secondArray.includes(x))

export const onArray = (firstArray, secondArray, opt) => {

  const fArray = firstArray instanceof Array
  if(!fArray){
    firstArray = [firstArray]
  }

  const sArray = secondArray instanceof Array
  if(!sArray){
    secondArray = [secondArray]
  }

  var val = -1
  if(opt === true){
	  val = 1
  }
  
  return firstArray.filter((el) => secondArray.indexOf(el) === val)
  // return firstArray.every((el) => secondArray.indexOf(el) > -1)
}

export const filterByReference = (Arr1, Arr2, sub1, sub2, opt) => {
  return Arr1.filter(el => {
	  if(!opt){
      return !Arr2.find(element => el[sub1] === element[sub2])
	  }else{
  		return Arr2.find(element => el[sub1] === element[sub2])
	  }
  });
}

export const sortArrObj = (arrObj, sub) => {
    return arrObj.sort((a, b) => {
    	let fa = a[sub].toLowerCase(), fb = b[sub].toLowerCase();

    	if (fa < fb) {
        	return -1;
    	}
    	
	if (fa > fb) {
        	return 1;
    	}

    	return 0;
    });
}

export const groupBy = (items, key) => items.reduce(
  (result, item) => ({
    ...result,
    [item[key]]: [
    ...(result[item[key]] || []),
    item,
    ],
  }), 
  {},
);
