import {Byte_Array_Base, Byte_Array_Error, decode_escaped_string} from './base.js';
import {Error_Type} from './types.js';

export class Byte_Array_String
{
    static to(data, opt = {})
    {
        let container = Byte_Array_Base.raw(data),
            prefix = opt.hasOwnProperty('prefix') ? opt.prefix : '\\x',
            suffix = opt.hasOwnProperty('suffix') ? opt.suffix : '';
        opt.pad_size = opt.hasOwnProperty('pad_size') ? opt.pad_size : 2;
        opt.pad_char = opt.hasOwnProperty('pad_char') ? opt.pad_char : '0';
        
        let str = "";
        container.forEach(v => {
            str += Byte_Array_String.is_ascii_int(v) 
                ? String.fromCharCode(v) 
                : prefix + Byte_Array_Base._set_data_opt(Byte_Array_Base.to_hex_string(v), opt) + suffix;
        });
        
        return str;
    }
        
    static from(string, opts = {})
    {
        console.assert(typeof string === 'string', 'Argument must be a string');
        
        let options = {...{escaped_string: true}, ...opts},
            container = [];
        
        if(options.escaped_string)
            container = decode_escaped_string(string);
        else {
            container = [];
            for(let i = 0, strLen = string.length; i < strLen; i++)
                container.push(string.charCodeAt(i));
        }
        
        return container;
    }
    
    static is_ascii_int(i)
    {
        return i >= 32 && i < 126;
    }
    
    static is_printable(c)
    {
        return c >= ' ' && c < '~';
    }

    static is_ascii_char(char)
    {
        return char.length === 1;
    }
        
    static is_ascii_string(str)
    {
        for(let i = 0, strLen = str.length; i < strLen; i++){
            if(!Byte_Array_String.is_ascii_char(str[i])) 
                return false;
        }
        
        return true;
    }
    
    static clear_no_digit_char(string, opts = {})
    {
        opts = {...{allowed: ' '}, ...opts};
        return string.replace(new RegExp(`[^0-9${opts.allowed}]`, 'g'), '');
    }
    
    static num_bytes(){ return 1; }
}
