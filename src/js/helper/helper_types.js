import {is_int_at_printable_range} from './helpers_basic.js';

export function validate_ipv4_addr(addr)
{
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(addr);
}

/*
* Not checking: 
* * size of middle domain (1-63);
* * hifen(-) begining and end of domain;
*/
export function validate_domain_name(domain)
{
    if(typeof domain !== "string"){
        return false;
    }
    return /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/.test(domain);
}

export function check_string_int(number_str)
{
    if(typeof number_str !== "string"){
        return false;
    }
    return /^[-+]?[0-9]+$/.test(number_str);
}

export function validate_port(port)
{
    if(typeof port == "string"){
        if(!check_string_int(port)){
            return false;
        }
        port = parseInt(port);
    }
    if(!(Number.isNaN(port) || port <= 0 || port > 65535)){
        return port;
    }
    return false;
}

export function number_to_string_hex(num, add_sufix = false){
    console.assert(typeof num === 'number', '"num" must be a number');
    let str = ('0' + num.toString(16)).substr(-2, 2);
    return add_sufix ? '0x' + str : str;
}

export function number_to_string_bin(num){
    console.assert(typeof num === 'number', '"num" must be a number');
    return ('00000000' + d.toString(2)).substr(-8, 8);    
}

/**
 * Converte uma string em array de inteiros
 */
export function convert_string_to_array_int(data){
    if(typeof data != 'string') return undefined;
    
    let new_data = [];
    for(let i = 0, strLen = data.length; i < strLen; i++)
        new_data.push(data.charCodeAt(i));
    
    return new_data;
}

/**
 * Converte uma string, ou array de inteiros, ou Uint8Array, em string,
 * escapando ('\') os caracteres nao imprimiveis
 */
export function convert_to_string(data){
    if(typeof data == 'string') return data;
//     Making sure that no printable chars (like \n is shown) (necessary?)
//    if(typeof data == 'string'){
//        let new_data = "";
//        for(let i = 0; i < data.length; i++){
//            if(is_int_at_printable_range(data.charCodeAt(i))){
//                new_data += data[i];
//            } else {
//                new_data += '\\' +  ('0' + data[i].toString(16)).substr(-2, 2);
//            }
//        }
//        return new_data;
//    }
    
    if(data instanceof Array || data instanceof Uint8Array){
        let str = '';
        data.forEach((d,idx) => {
            if(is_int_at_printable_range(d)){
                str += String.fromCharCode(d);
            }else{
                str += '\\' +  ('0' + d.toString(16)).substr(-2, 2);
            }
        });
        return str;
    } else if (typeof data === 'object'){
        let str = '';
        Object.keys(data).forEach((d,idx) => {
            if(is_int_at_printable_range(data[d]))
                str += String.fromCharCode(data[d]);
            else
                str += '\\' +  ('0' + data[d].toString(16)).substr(-2, 2);
        });
        return str;
    }
    return undefined;
}

/**
 * Converte uma string, ou array de inteiros, ou um Array8int em uma string
 * de valores hexadecimais
 */
export function convert_to_string_hex(data, delimiter = ' ', num = 2)
{
    let new_data;
    if(typeof data == 'string'){
       new_data = convert_string_to_array_int(data);
    } else if(data instanceof Array || data instanceof Uint8Array) 
        new_data = data;
    else if(typeof data === 'object'){
      new_data = [];
      Object.keys(data).forEach(d => new_data.push(data[d]));  
    } else return undefined;
    
    let str = '';
    new_data.forEach((d,idx) => {
        if(idx != 0 && (idx % num == 0)){
            str += delimiter;
        }
        str += ('0' + d.toString(16)).substr(-2, 2);
    });
    
    return str;
}

/**
 * Converte uma string, ou array de inteiros, ou um Array8int em uma string
 * de valores binarios
 */
export function convert_to_string_bin(data, delimiter = ' '){
    let new_data;
    if(typeof data == 'string'){
       new_data = convert_string_to_array_int(data);
    } else if(data instanceof Array || data instanceof Uint8Array) 
        new_data = data;
     else if(typeof data === 'object'){
        new_data = [];
        Object.keys(data).forEach(d => new_data.push(data[d])); 
     }else return undefined;
        
    let str = '';
    new_data.forEach((d,idx) => {
        str += ('00000000' + d.toString(2)).substr(-8, 8);
        str += delimiter;
    });
    
    return str;
}
