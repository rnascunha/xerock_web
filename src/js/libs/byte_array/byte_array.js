import {Byte_Array_Error, Byte_Array_Base} from './base.js';
import {Error_Type, Data_Type} from './types.js';
import {Byte_Array_String} from './string.js';
import {Byte_Array_Hex} from './hex.js';
import {Byte_Array_Binary} from './binary.js';
import {Byte_Array_Int8} from './int8.js';
import {Byte_Array_UInt8} from './uint8.js';
import {Byte_Array_Int16} from './int16.js';
import {Byte_Array_UInt16} from './uint16.js';
import {Byte_Array_Int32} from './int32.js';
import {Byte_Array_UInt32} from './uint32.js';
import {Byte_Array_Int64} from './int64.js';
import {Byte_Array_UInt64} from './uint64.js';

export class Byte_Array
{
    constructor(data = [], type = null, options = {})
    {
        this._container = [];
        
        if(type === null)
            this.raw(data);
        else
            this.from(data, type, options);
    }
    
    from(string, data_type = Data_Type.STRING.value, opts = {})
    {
        if(!(data_type in Data_Type))
            throw new Byte_Array_Error(Error_Type.UNKNOW_TYPE, data_type);
        
        if(typeof string == 'number')
            string = `${string}`;
        
        if(typeof string != 'string')
            throw new Byte_Array_Error(Error_Type.WRONG_ARGUMENT, string);
        
        if(string === "")
        {
            this._container = [];
            return "";
        }
        
        this._container = Data_Type[data_type].from(string, opts);
        return Data_Type[data_type].from(string, opts);
    }
    
    to(data_type, opt = {})
    {
        if(!(data_type in Data_Type))
            throw new Byte_Array_Error(Error_Type.UNKNOW_TYPE, data_type);
        
        return Data_Type[data_type].to(this._container, opt);
    }
    
    to_arr(data_type, opt = {})
    {
        if(!(data_type in Data_Type))
            throw new Byte_Array_Error(Error_Type.UNKNOW_TYPE, data_type);
        
        return Data_Type[data_type].to_arr(this._container, opt);
    }
    
    static parse(data, data_type, opt = {})
    {
        if(!(data_type in Data_Type))
            throw new Byte_Array_Error(Error_Type.UNKNOW_TYPE, data_type);
        console.log('data', data, data_type);
        return Data_Type[data_type].from(data, opt);
    }
    
    static num_bytes(data_type)
    {
        if(!(data_type in Data_Type))
            throw new Byte_Array_Error(Error_Type.UNKNOW_TYPE, data_type);
       
        return Data_Type[data_type].num_bytes();
    }
    
    static is_valid_char(char, data_type)
    {
        if(!(data_type in Data_Type))
            throw new Byte_Array_Error(Error_Type.UNKNOW_TYPE, data_type);
        
        return Data_Type[data_type].is_valid_char(char);
    }
    
    static clear_invalid_char(string, data_type, opt = {})
    {
        if(!(data_type in Data_Type))
            throw new Byte_Array_Error(Error_Type.UNKNOW_TYPE, data_type);

        return Data_Type[data_type].clear_invalid_char(string, opt);
    }
    
    static convert(string, from_type, to_type, options = {})
    {
        if(!(from_type in Data_Type) || !(to_type in Data_Type))
            throw new Byte_Array_Error(Error_Type.UNKNOW_TYPE, [from_type, to_type]);
        
        let container = Data_Type[from_type].from(string, options);
        
        return Data_Type[to_type].to(container, options);
    }
    
    size()
    {
        return this._container.length;
    }
    
    raw(data = null)
    {
        if(data !== null)
            this._container = Byte_Array.raw(data);
        return Object.assign([], this._container);
    }
    
    is_ascii_string()
    {
        return this._container.every(c => Byte_Array_String.is_ascii_int(c));
    }
    
    static raw(data = null)
    {
        return Byte_Array_Base.raw(data);
    }
        
    raw_str(opt = {})
    {
        return this.uint8(opt);
    }
    
    static is_ascii_char(char)
    {
        return Byte_Array_String.is_ascii_char(char);
    }
    
    /**
    * 
    * String
    *
    */
    
    string(opt = {})
    {
        return Byte_Array_String.to(this._container, opt);
    }
    
    string_to_array(string, opts = {})
    {
        this._container = Byte_Array_String.from(string, opts);
        
        return this._container;
    }

    /*
    *
    * Hexadecimal
    *
    */
    hex(opt = {})
    {
        return Byte_Array_Hex.to(this._container, opt);
    }
    
    hex_arr(opt = {})
    {
        return Byte_Array_Hex.to_arr(this._container, opt);
    }

    string_hex_to_array(string, opts = {})
    {
        this._container = Byte_Array_Hex.from(string, opts);
        
        return this._container;
    }
     
    /*
    *
    * Binary
    *
    */
    binary(opt = {})
    {
        return Byte_Array_Binary.to(this._container, opt);
    }
    
    binary_arr(opt = {})
    {
        return Byte_Array_Binary.to_arr(this._container, opt);
    }
    
    string_binary_to_array(string, opts = {})
    {
        this._container = Byte_Array_Binary.from(string, opts);
        
        return this._container;
    }
    
    /*
    *
    * Int8
    *
    */
    int8(opt = {})
    {
        return Byte_Array_Int8.to(this._container, opt);
    }
    
    int8_arr(opt = {})
    {
        return Byte_Array_Int8.to_arr(this._container, opt);
    }
    
    string_int8_to_array(string, opts = {})
    {
        this._container = Byte_Array_Int8.from(string, opts);
        
        return this._container;
    }
    
    /*
    *
    * Uint8
    *
    */
    uint8(opt = {})
    {
        return Byte_Array_UInt8.to(this._container, opt);
    }
    
    uint8_arr(opt = {})
    {
        return Byte_Array_UInt8.to_arr(this._container, opt);
    }
    
    string_uint8_to_array(string, opts = {})
    {
        this._container = Byte_Array_UInt8.from(string, opts);
        
        return this._container;
    }
           
    /*
    *
    * Int16
    *
    */
    int16(big_endian = true, opt = {})
    {
        return Byte_Array_Int16.to(this._container, big_endian, opt);
    }
    
    int16_arr(big_endian = true, opt = {})
    {
        return Byte_Array_Int16.to_arr(this._container, big_endian, opt);
    }
        
    string_int16_to_array(string, big_endian = true, opts = {})
    {
        this._container = Byte_Array_Int16.from(string, big_endian, opts);
        
        return this._container;
    }
    
    /*
    *
    * Uint16
    *
    */
    uint16(big_endian = true, opt = {})
    {
        return Byte_Array_UInt16.to(this._container, big_endian, opt);
    }
    
    uint16_arr(big_endian = true, opt = {})
    {
        return Byte_Array_UInt16.to_arr(this._container, big_endian, opt);  
    }
        
    string_uint16_to_array(string, big_endian = true, opts = {})
    {
        this._container = Byte_Array_UInt16.from(string, big_endian, opts);
        
        return this._container;
    }
        
    /*
    *
    * Int32
    *
    */
    int32(big_endian = true, opt = {})
    {
        return Byte_Array_Int32.to(this._container, big_endian, opt);
    }
    
    int32_arr(big_endian = true, opt = {})
    {
        return Byte_Array_Int32.to_arr(this._container, big_endian, opt);
    }
    
    string_int32_to_array(string, big_endian = true, opts = {})
    {
        this._container = Byte_Array_Int32.from(string, big_endian, opts);
        
        return this._container;
    }

    /*
    *
    * Uint32
    *
    */
    uint32(big_endian = true, opt = {})
    {
        return Byte_Array_UInt32.to(this._container, big_endian, opt);
    }
            
    uint32_arr(big_endian = true, opt = {})
    {
        return Byte_Array_UInt32.to_arr(this._container, big_endian, opt);
    }
    
    string_uint32_to_array(string, big_endian = true, opts = {})
    {
        this._container = Byte_Array_UInt32.from(string, big_endian, opts);
        
        return this._container;
    }

    /*
    *
    * Int64
    *
    */
    int64(big_endian = true, opt = {})
    {
        return Byte_Array_Int64.to(this._container, big_endian, opt);
    }
    
    int64_arr(big_endian = true, opt = {})
    {
        return Byte_Array_Int64.to_arr(this._container, big_endian, opt);
    }
    
    string_int64_to_array(string, big_endian = true, opts = {})
    {
        this._container = Byte_Array_Int64.from(string, big_endian, opts);
        
        return this._container;
    }

    /*
    *
    * Uint64
    *
    */
    uint64(big_endian = true, opt = {})
    {
        return Byte_Array_UInt64.to(this._container, big_endian, opt);
    }
    
    uint64_arr(big_endian = true, opt = {})
    {
        return Byte_Array_UInt64.to_arr(this._container, big_endian, opt);
    }
    
    string_uint64_to_array(string, big_endian = true, opts = {})
    {
        this._container = Byte_Array_UInt64.from(string, big_endian, opts);
        
        return this._container;
    }
}
