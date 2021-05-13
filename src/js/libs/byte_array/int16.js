import {Byte_Array_Base, Byte_Array_Error} from './base.js';
import {Error_Type} from './types.js';

export class Byte_Array_Int16
{
    static to(data, big_endian = false, opt = {})
    {
        opt = {...{sep: ' ', aggregate: 0, pad_size: 0, pad_char: ' '}, ...opt};
        return  Byte_Array_Base._set_arr_option(Byte_Array_Int16.to_arr(data, big_endian, opt), opt);;
    }
    
    static to_arr(data, big_endian = false, opt = {})
    {
        let container = Byte_Array_Base.raw(data);
        opt = {...{padding: true, sep: ' ', aggregate: 0, pad_size: 0, pad_char: ' '}, ...opt};

        let temp = [],
            dv = new DataView(new Uint8Array(container).buffer);
        
        let remainder = dv.byteLength % 2;
        if(!opt.padding && remainder)
            throw new Byte_Array_Error(Error_Type.INVALID_SIZE, remainder); 
        
        let len = dv.byteLength / 2 - remainder;
        for(let i = 0; i < len; i++)
            temp.push(Byte_Array_Base._set_data_opt(dv.getInt16(i * 2, big_endian), opt));
        
        if(remainder){
            let buf_r = new ArrayBuffer(2),
                arr = new Uint8Array(buf_r);
                arr.set(container.slice(-remainder), 2 - remainder);
            
             temp.push(Byte_Array_Base._set_data_opt(new DataView(arr.buffer).getInt16(0, big_endian), opt));
        }
        
        return temp;
    }
        
    static from(string, big_endian = false, opts = {})
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
        
        if(!Byte_Array_Int16.is_int16_array(temp))
            throw new Byte_Array_Error(Error_Type.OUT_OF_BOUND, temp);
        
        let buf = new ArrayBuffer(temp.length * 2),
            dv = new DataView(buf);
        temp.forEach((v, idx) => {
           dv.setInt16(idx * 2, v, big_endian); 
        });
        
        let arr = new Uint8Array(buf);
        
        let container = [];
        arr.forEach(v => container.push(v));
        
        return container;        
    }
    
    static is_int16_array(arr)
    {
        return arr.every(num => Byte_Array_Int16.is_int16_num(num));
    }
    
    static is_int16_num(num)
    {
        return num >= -32768 && num <= 32767;
    }
    
    static num_bytes_int16(){ return 2; }
}