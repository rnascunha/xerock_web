import {Byte_Array_Base, Byte_Array_Error} from './base.js';
import {Error_Type} from './types.js';

export class Byte_Array_UInt8
{
    static to(data, opt = {})
    {
        opt = {...{sep: ' ', aggregate: 0, pad_size: 0, pad_char: ' '}, ...opt};
        return Byte_Array_Base._set_arr_option(Byte_Array_UInt8.to_arr(data, opt), opt);
    }
    
    static to_arr(data, opt = {})
    {
        let container = Byte_Array_Base.raw(data);
        opt = {...{sep: ' ', aggregate: 0, pad_size: 0, pad_char: ' '}, ...opt};
        let temp = [],
            arr = new Uint8Array(container);
        
        arr.forEach(v => {
            temp.push(Byte_Array_Base._set_data_opt(v, opt));
        });
        
        return temp;
    }
    
    static from(string, opts = {})
    {
        console.assert(typeof string === 'string', 'Argument must be a string');

        let options = {...{separator: ' '}, ...opts};
        string = Byte_Array_Base._separator(string, options.separator, null, ' ');
        
        if(options.separator !== undefined && Byte_Array_Base.invalid_number_char(string))
            throw new Byte_Array_Error(Error_Type.INVALID_CHAR, string);
        
        let temp = string.match(/[+-]{0,1}[0-9]+/gi);
        if(!temp)
            throw new Byte_Array_Error(Error_Type.WRONG_ARGUMENT, string);

        temp = temp.map(function(h){ return parseInt(h, 10)});
        
        if(!Byte_Array_UInt8.is_uint8_array(temp))
            throw new Byte_Array_Error(Error_Type.OUT_OF_BOUND, temp);
        
        return temp;
    }
        
    static is_uint8_num(num)
    {
        return num >= 0 && num <= 255;
    }
    
    static is_uint8_array(arr)
    {
        return arr.every(num => Byte_Array_UInt8.is_uint8_num(num));
    }
    
    static num_bytes(){ return 1; }
}