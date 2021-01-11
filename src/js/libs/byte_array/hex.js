import {Byte_Array_Base, Byte_Array_Error} from './base.js';
import {Error_Type} from './types.js';

export class Byte_Array_Hex
{    
    static to(data, opt = {})
    {
        opt = {...{sep: ' ', aggregate: 2, pad_size: 2, pad_char: '0'}, ...opt};
        
        return Byte_Array_Base._set_arr_option(Byte_Array_Hex.to_arr(data, opt), opt);
    }
    
    static to_arr(data, opt = {})
    {
        let container = Byte_Array_Base.raw(data);
        opt = {...{sep: ' ', aggregate: 2, pad_size: 2, pad_char: '0'}, ...opt};
        
        let temp = [];
        container.forEach(v => {
            temp.push(Byte_Array_Base._set_data_opt(Byte_Array_Base.to_hex_string(v, opt.uppercase), opt));
        });
        
        return temp;
    }
            
    static from(string, opts = {})
    {
        console.assert(typeof string === 'string', 'Argument must be a string');

        let options = {...{separator: ' ', padding: true}, ...opts};
        
        string = Byte_Array_Base._separator(string, options.separator, Byte_Array_Hex.clear_no_hex_char, '');
        
        if(!Byte_Array_Hex.is_hex_string(string))
            throw new Byte_Array_Error(Error_Type.INVALID_CHAR, string);

        if(!options.padding && string.length % 2)
            throw new Byte_Array_Error(Error_Type.INVALID_SIZE, string.length % 2);
        
        let container = string.match(/[\da-fA-F]{1,2}/gi)
                    .map(function (h) { return parseInt(h, 16)});
        
        return container;
    }
    
//    static to_hex_string(num, uppercase = false)
//    {
//        if(!(typeof num == 'number' && num >= 0 && num <= 255))
//            throw new Byte_Array_Error(Error_Type.WRONG_ARGUMENT, num);
//
//        return uppercase ? num.toString(16).toUpperCase() : num.toString(16).toLowerCase();
//    }
    
    static clear_no_hex_char(string)
    {
        return string.replace(/[^0-9a-f]/gi, '');
    }

    static is_hex_char(char){
        return (char >= '0' && char <= '9') 
                || (char >='a' && char <= 'f')
                || (char >= 'A' && char <= 'F');
    }
    
    static is_hex_string(str)
    {
        for(let i = 0, strLen = str.length; i < strLen; i++){
            if(!Byte_Array_Hex.is_hex_char(str[i])) 
                return false;
        }
        
        return true;
    }
    
    static num_bytes(){ return 1; }
}