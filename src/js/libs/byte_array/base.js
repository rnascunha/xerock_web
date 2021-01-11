import {Escape_Characters, Error_Type} from './types.js';

export class Byte_Array_Error extends Error
{
    constructor(error, arg = false)
    {
        super(error.message);
        this._code = error.code;
        
        this._arg = arg;
    }
    
    get code(){ return this._code; }
    get arg(){ return this._arg; }
}

export function decode_escaped_string(str)
{
    console.assert(typeof str === 'string', 'Wrong argument');
    return str.match(/\\x[0-9a-f]{1,2}|\\[0abefnrtv\\]|.{1}|\n/gi).map(d => {
        if(d.length === 1)
            return d.charCodeAt(0);
        d = d.slice(1);
        if(d in Escape_Characters)
            return Escape_Characters[d].hex;
        return parseInt(d.slice(1), 16)
    })
}

export class Byte_Array_Base
{
    static raw(data = null)
    {
        let container = [];
        if(data != null && (data instanceof Array || data instanceof Uint8Array))
        {
            if(Byte_Array_Base.is_uint8_array(data))
                if(data instanceof Array)
                    container = Object.assign([], data);
                else
                    container =  Array.from(data);
        }  
        
        return container;
    }
    
    static _set_arr_option(arr, opt = {})
    {
        let sep = opt.hasOwnProperty('sep') ? opt.sep : ' ',
            aggregate = opt.hasOwnProperty('aggregate') ? opt.aggregate : 0;
        
        let str = "";
        arr.forEach((v, idx) => {
           if(aggregate > 1 &&  (idx % aggregate) != 0)
                str += v;
            else {
                if(idx != 0) str += sep;
                str += v;
            }
        });
        
        return str;
    }
    
    static _set_data_opt(data, opt = {})
    {
        data = '' + data;
    
        let pad_size = opt.hasOwnProperty('pad_size') ? opt.pad_size : 0,
            pad_char = opt.hasOwnProperty('pad_char') ? opt.pad_char : '0';
        
        return data.padStart(pad_size, pad_char);
    }
    
    static _separator(string, separator, undefined_behaviour, replace_for)
    {
        if(separator === null) return string;
        if(separator === undefined)
            return undefined_behaviour ? undefined_behaviour(string) : string;
        else if(separator)
        {
            if(separator instanceof RegExp)
                return string.replace(separator, '');
            if(typeof separator === 'string')
                return string.replace(new RegExp(`[${separator}]`, 'g'), replace_for);
            throw new Byte_Array_Error(Error_Type.WRONG_ARGUMENT, separator);
        }
        
        return string;
    }
    
    static invalid_number_char(string)
    {
        return /[^\+\-0-9 ]+/.test(string);
    }
    
    static to_hex_string(num, uppercase = false)
    {
        if(!(typeof num == 'number' && num >= 0 && num <= 255))
            throw new Byte_Array_Error(Error_Type.WRONG_ARGUMENT, num);

        return uppercase ? num.toString(16).toUpperCase() : num.toString(16).toLowerCase();
    }
    
    static is_uint8_num(num)
    {
        return num >= 0 && num <= 255;
    }
    
    static is_uint8_array(arr)
    {
        return arr.every(num => Byte_Array_Base.is_uint8_num(num));
    }
    
    static clear_no_digit_char(string, opts = {})
    {
        opts = {...{allowed: ' '}, ...opts};
        return string.replace(new RegExp(`[^0-9${opts.allowed}]`, 'g'), '');
    }
    
    static invalid_number_char(string)
    {
        return /[^\+\-0-9 ]+/.test(string);
    }
}
