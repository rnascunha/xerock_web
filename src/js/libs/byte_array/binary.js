import {Byte_Array_Base, Byte_Array_Error} from './base.js';
import {Error_Type} from './types.js';

export class Byte_Array_Binary
{
    static to(data, opt = {})
    {
        opt = {...{sep: ' ', aggregate: 0, pad_size: 8, pad_char: '0'}, ...opt};
        return Byte_Array_Base._set_arr_option(Byte_Array_Binary.to_arr(data, opt), opt);
    }
    
    static to_arr(data, opt = {})
    {
        let container = Byte_Array_Base.raw(data);
        opt = {...{sep: ' ', aggregate: 0, pad_size: 8, pad_char: '0'}, ...opt};
        
        let temp = [];
        container.forEach(v => {
            temp.push(Byte_Array_Base._set_data_opt(Byte_Array_Binary.to_binary_string(v), opt));
        });
        
        return temp; 
    }
        
    static from(string, opts = {})
    {
        console.assert(typeof string === 'string', 'Argument must be a string');
        
        let options = {...{separator: ' ', padding: true}, ...opts};
        string = Byte_Array_Base._separator(string, options.separator, Byte_Array_Binary.clear_no_binary_char, '');
        
        if(!Byte_Array_Binary.is_binary_string(string))
            throw new Byte_Array_Error(Error_Type.INVALID_CHAR, string);
        
        if(!options.padding && string.length % 8)
            throw new Byte_Array_Error(Error_Type.INVALID_SIZE, string.length % 8);
        
        let container = string.match(/[01]{1,8}/gi)
                    .map(function(h) { return parseInt(h, 2)});
        
        return container;
    }
        
    static to_binary_string(num)
    {
        if(!(typeof num == 'number' && num >= 0 && num <= 255))
            throw new Byte_Array_Error(Error_Type.WRONG_ARGUMENT, num);
        
        return num.toString(2);    
    }
    
    static clear_no_binary_char(string)
    {
        return string.replace(/[^01]/g, '');
    }
        
    static is_binary_char(char){
        return char === '1' || char ==='0';
    }
    
    static is_binary_string(str)
    {
        for(let i = 0, strLen = str.length; i < strLen; i++){
            if(!Byte_Array_Binary.is_binary_char(str[i])) 
                return false;
        }
        
        return true;
    }
    
    static num_bytes(){ return 1; }
}