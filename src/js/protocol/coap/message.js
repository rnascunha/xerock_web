import * as coap from './types.js';
import {is_valid_token, is_valid_type, 
        is_valid_code, is_valid_mid,
        is_valid_options} from './test_types.js';
import {remove_leading_zeros} from './helper.js';

import {Byte_Array} from '../../libs/byte_array/byte_array.js';
import {Data_Type} from '../../libs/byte_array/types.js';
import {Byte_Array_UInt8} from '../../libs/byte_array/uint8.js';

export class option{
    constructor(code, value = null)
    {
        this._code = option.get_code(code);
        if(!this._code) return null;
        
        if(!option.check(this._code, value)) return null;
        this._value = value;
        this._data = option.make_data(this._value);
    }
    
    get code(){ return this._code; }
    get value(){ return this._value; }
    get data(){ return this._data; }
    get size(){ return this._data.length; }
    
    static make_data(value)
    {
        if(value === null) return [];
        if(typeof value === 'string') return Byte_Array.parse(value, Data_Type.text.value);
        if(value instanceof Array) return value;
        if(typeof value === 'number' 
           && Number.isInteger(value))
        {
            return remove_leading_zeros(Byte_Array.parse(value, Data_Type.uint32be.value));
        }
        return null;
    }
        
    static get_code(code)
    {
        if(typeof code == 'string')
        {
            if(!(code in coap.option)) return null;
            code = op.code;
        }
        else (typeof code == 'number')
        {
            if(!(Object.values(coap.option).find(o => o.code == code))) return null;
        }
        return code;
    }
    
    static check(code, value = null)
    {
        code = option.get_code(code);
        if(!code) return `code not found`;
                
        let op = coap.option_by_code(code);
        if(!op) return `op not found [${op}]`;
                
        switch(op.type)
        {
            case 'empty':
                return value != null ? 'invalid type' : true;
            case 'uint':
                if(typeof value != 'number' || !Number.isInteger(value))
                    return 'invalid type';
                if(value < (Math.pow(2, 8 * op.min) - 1) 
                   || value > (Math.pow(2, 8 * op.max) - 1))
                    return 'out of bound';
                break;
            case 'string':
                if(typeof value != 'string')
                    return 'invalid type';
                if(value.length < op.min
                   || value.length > op.max)
                    return 'out of bound';
                break;
            case 'opaque':
                if(!(value instanceof Array))
                    return 'invalid type';
                if(value.length < op.min
                   || value.length > op.max)
                    return 'out of bound';
                if(!Byte_Array_UInt8.is_uint8_array(value))
                    return 'invalid value';                
                break;
            default:
                return 'invalid type type';
        }
        return true;
    }
    
    static make_block(number, more, szx)
    {
        return szx | (more ? 1 : 0) | (number << 4);
    }
    
    static szx_2_block_size(szx)
    {
        return Math.pow(2, szx + 4);
    }
    
    static block_size_2_szx(bsize)
    {
        return Math.log2(bsize) - 4;
    }
    
    static parse_block(value)
    {
        const szx = value & 0b111;
        return {
            szx: szx,
            more: (value & 0b1000) >> 3,
            number: value >> 4,
            size: szx == 7 ? 'BERT' : option.szx_2_block_size(szx)
        }
    }
    
    static process(code, data)
    {
        const op = coap.option_by_code(code);
        if(!op) return {value: null, data: null, special: null, error: ['option not found'], has_error: true};
        
        let special = null;
        
        if(op.value == coap.option.block1.value 
           || op.value == coap.option.block2.value)
        {
           let v = +Byte_Array.to(data, Data_Type.uint32be.value),
               pb = option.parse_block(v);
            
            special = `${pb.number}/${pb.more ? 'M' : '_'}/${pb.size}(${pb.szx})`;
        } 
        else if(op.value == coap.option.no_response.value)
        {
            let r = +Byte_Array.to(data, Data_Type.uint32be.value),
                rr = [];
            
            if(coap.no_response.success.code & r) rr.push(coap.no_response.success.name);
            if(coap.no_response.client_error.code & r) rr.push(coap.no_response.client_error.name);
            if(coap.no_response.server_error.code & r) rr.push(coap.no_response.server_error.name);
            
            special = rr.join('/');
        } 
        else if(op.value == coap.option.accept.value
               || op.value == coap.option.content_format.value)
        {
            let c = +Byte_Array.to(data, Data_Type.uint32be.value),
                ct = coap.content_format_by_code(c);
            special = ct ? ct.name : null;
        }
        
        switch(op.type)
        {
            case 'empty':
                if(data.length)
                    return {
                        value: op.value, 
                        data: data, 
                        str_data: Byte_Array.to(data, Data_Type.hex.value), 
                        special: special, 
                        error: ['incompatiable data'], 
                        has_error: true
                    };
                else
                    return {
                        value: op.value, 
                        data: null, 
                        str_data: '', 
                        special: special, 
                        error: [], 
                        has_error: false
                    };
            case 'string':
                let dd = Byte_Array.to(data, Data_Type.text.value);
                return {
                    value: op.value, 
                    data: dd,
                    str_data: dd,
                    special: special, 
                    error: [], 
                    has_error: false
                };
            case 'uint':
                let ddd = +Byte_Array.to(data, Data_Type.uint32be.value);
                return {
                    value: op.value, 
                    data: +ddd,
                    str_data: ddd,
                    special: special, 
                    error: [], 
                    has_error: false
                };
            case 'opaque':
                return {
                    value: op.value, 
                    data: data, 
                    str_data: Byte_Array.to(data, Data_Type.hex.value),
                    special: special, 
                    error: [], 
                    has_error: false
                };
            default:
                break;
        }
        return null;
    }
    
    static parse(data, delta)
    {
        if(!Array.isArray(data) || typeof delta != 'number')
        {
            return {data: [], error: ['type error'], has_error: true};
        }
        if(!data.length) 
            return {data: [], error: ['argument too short'], has_error: true};
        if(data[0] == coap.payload_marker) 
            return {data: [], error: ['payload marker'], has_error: true};
        
        let opt_delta = data[0] >> 4, code = 0,
            opt_len = data[0] & 0x0F, len = 0,
            size = 1;
        data.shift();
        
        if(opt_delta > 12)
        {
            if(opt_delta == 13)
            {
                if(!data.length) 
                    return {data: [], error: ['argument too short'], has_error: true};
                code = delta + data[0] + 13,
                data.shift();
                size += 1;
            }
            else if(opt_delta == 14)
            {
                if(data.length < 2) 
                    return {data: [], error: ['argument too short'], has_error: true};
                code = delta + ((data[0] << 8) | data[1]) + 269;
                data.shift();
                data.shift();
                size += 2;
            }
            else
                return {data: [], error: ['invalid data'], has_error: true};
        }
        else
        {
            code = delta + opt_delta;
        }
        
        if(opt_len > 12)
        {
            if(opt_len == 13)
            {
                if(!data.length) 
                    return {data: [], error: ['argument too short'], has_error: true};
                len = delta + data[0] + 13;
                data.shift();
                size += 1;
            }
            else if(opt_len == 14)
            {
                if(data.length < 2)  
                    return {data: [], error: ['argument too short'], has_error: true};
                len = delta + (data[0] << 8 | data[1]) + 269;
                data.shift();
                data.shift();
                size += 2;
            }
            else
                return {data: [], error: ['invalid data'], has_error: true};
        }
        else
        {
            len = opt_len;
        }
        size += len;
        
        if(data.length < len)  
            return {data: [], error: ['argument too short'], has_error: true};
        
        let d = [];
        for(let i = 0; i < len; i++)
        {
            d.push(data.shift());
        }
        
        return {data: {code: code, length: len, data: d, size: size}, error: [], has_error: false};
    }
    
    static serialize(opt, delta)
    {
        let data = [];
        let n_delta = opt.code - delta, delta_opt = 0, delta_ext = 0;
        if(n_delta > 12)
        {
            if(n_delta < 269)
            {
                delta_opt = 13;
                delta_ext = n_delta - 13;
            }
            else
            {
                delta_opt = 14;
                delta_ext = n_delta - 269;
            }
        }
        else
            delta_opt = n_delta;
        
        let len_opt = opt.size, len_ext = 0;
        if(opt.size > 12)
        {
            if(opt.size < 269)
            {
                len_opt = 13;
                len_ext = opt.size - 13;
            }
            else
            {
                len_opt = 14;
                len_ext = opt.size - 269;
            }
        }
        else
            len_opt = opt.size;
        
        data.push(delta_opt << 4 | len_opt);
        switch(delta_opt)
        {
            case 13:
                data.push(delta_ext);
                break;
            case 14:
                data.push(delta_ext >> 8);
                data.push(delta_ext & 0xFF);
                break;
            default:
                break;
        }
        switch(len_opt)
        {
            case 13:
                data.push(len_ext);
                break;
            case 14:
                data.push(len_ext >> 8);
                data.push(len_ext & 0xFF);
                break;
            default:
                break;
        }
        if(opt.size)
        {
            data = data.concat(opt.data);
        }
        return {data: data, error: [], has_error: false };
    }
}

export class message{    
    static serialize_header(type, code, mid, token)
    {
        let data = [];

        if(typeof type == 'string')
        {
            if(!(type in coap.type)) return null;
            type = coap.type[type].code;
        }
        if(!is_valid_type(type)) return {data: data, error: ['invalid type'], has_error: true };
        
        if(typeof code == 'string')
        {
            if(!(type in coap.code)) return {data: data, error: ['invalid code'], has_error: true };
            code = coap.code[code].code;
        }
        if(!is_valid_code(code)) return {data: data, error: ['invalid code'], has_error: true };
        
        if(typeof token == 'string')
        {
            token = Byte_Array.parse(token, Data_Type.uint8.value);
        }
        if(!is_valid_token(token)) return {data: data, error: ['invalid token'], has_error: true };
        
        if(!is_valid_mid(mid)) return {data: data, error: ['invalid mid'], has_error: true };
        
        let header = (coap.version << 30) | (type << 28) | (token.length << 24) | (code << 16) | mid;
        
        data = Byte_Array.parse(header, Data_Type.uint32be.value);
        if(token.length)
        {
            data = data.concat(token);
        }

        return {data: data, error: [], has_error: false };
    }
    
    static serialize_header_realiable(code, token)
    {
        let data = [];
        
        if(typeof code == 'string')
        {
            if(!(type in coap.code)) return {data: data, error: ['invalid code'], has_error: true };
            code = coap.code[code].code;
        }
        if(!is_valid_code(code)) return {data: data, error: ['invalid code'], has_error: true };
        
        if(typeof token == 'string')
        {
            token = Byte_Array.parse(token, Data_Type.uint8.value);
        }
        if(!is_valid_token(token)) return {data: data, error: ['invalid token'], has_error: true };
                
        data.push(token.length, code);
        if(token.length)
        {
            data = data.concat(token);
        }

        return {data: data, error: [], has_error: false };
    }
        
    static serialize_options(options, check_repeat = true)
    {
        let data = [];
        if(!is_valid_options(options, check_repeat)) return {data: data, error: ['invalid options'], has_error: true };
        
        options.sort(function(op1, op2){ return op1.code - op2.code; });
        
        let delta = 0;
        options.forEach(op => {
            let d = option.serialize(op, delta);
            if(!d.has_error)
            {
                data = data.concat(d.data);
            }
            delta = op.code;
        });
        return {data: data, error: [], has_error: false};
    }
    
    static serialize_payload(payload)
    {
        if(typeof payload == 'string')
        {
            try{
                payload = Byte_Array.parse(payload, Data_Type.uint8.value);
            } catch(e){ return {data: [], error: ['invalid payload'], has_error: true }; }
        }
        if(!(payload instanceof Array)) return {data: [], error: ['invalid payload'], has_error: true };
        
        return !payload.length ? 
                                {data: [], error: [], has_error: false} 
                                : {data: [coap.payload_marker].concat(payload), error: [], has_error: false};
    }
    
    static serialize(type, code, mid, token, options = [], payload = [])
    {
        let data = [];
        
        let header = message.serialize_header(type, code, mid, token);
        data = data.concat(header.data);
        if(header.has_error) return {data: data, conn_type: 'unreliable', error: header.error, has_error: true };
        
        let options_s = message.serialize_options(options);
        data = data.concat(options_s.data);
        if(options_s.has_error) return {data: data, conn_type: 'unreliable', error: options_s.error, has_error: true };
        
        let payload_s = message.serialize_payload(payload);
        data = data.concat(payload_s.data);
        
        return {data: data, conn_type: 'unreliable', error: payload_s.error, has_error: payload_s.has_error };
    }
    
    static serialize_reliable(code, token, options = [], payload = [], set_length = true)
    {
        let data = [];
        
        let header = message.serialize_header_realiable(code, token);
        data = data.concat(header.data);
        if(header.has_error) return {data: data, 
                                     conn_type: 'reliable', 
                                     setted_length: set_length, 
                                     error: header.error, 
                                     has_error: true };
        
        let options_s = message.serialize_options(options);
        data = data.concat(options_s.data);
        if(options_s.has_error) return {data: data, 
                                        conn_type: 'reliable', 
                                        setted_length: set_length, 
                                        error: options_s.error, 
                                        has_error: true };
        
        let payload_s = message.serialize_payload(payload);
        data = data.concat(payload_s.data);
        if(payload_s.has_error) return {data: data, 
                                        conn_type: 'reliable', 
                                        setted_length: set_length, 
                                        error: payload_s.error, 
                                        has_error: payload_s.has_error};
        
        if(set_length)
        {
            let opt_len = 0, shift = 0, size = data.length - 2 - token.length;

            if(size < 13)
            {

            }
            else if(size < 269)
            {
                opt_len = 13;
                shift = 1;
                size -= 13;
            }
            else if(size < 65805)
            {
                opt_len = 14;
                shift = 2;
                size -= 269;
            }
            else
            {
                opt_len = 15;
                shift = 3;
                size -= 65805;
            }

            data[0] |= (opt_len != 0 ? (opt_len << 4) : (size << 4));
            if(shift)
            {
                size = Byte_Array.parse(size, Data_Type.uint32be.value);
                while(size.length != shift) size.pop();
                data = [data[0]].concat(size).concat(data.slice(1));
            }
        }
        
        return {data: data, 
                conn_type: 'reliable', 
                setted_length: set_length, 
                error: [], 
                has_error: false};
    }
        
    static parse_options(data)
    {
        let i = 0, options = [], delta = 0, size = 0;
        while(true)
        {
            if(data[i] == coap.payload_marker) break;
            let opt = option.parse(data, delta);
            if(opt.has_error)
            {
                return {data: options, error: [{option: opt, error:opt.error}], has_error: true};
            }
            let proc = option.process(opt.data.code, opt.data.data);
            opt.data.op_value = proc.value;
            opt.data.value = proc.data;
            opt.data.str_data = proc.str_data;
            opt.data.special = proc.special;
            opt.data.error = proc.error;
            opt.data.checked = option.check(opt.data.code, proc.data);
            
            options.push(opt);
            delta = opt.data.code;
            size += opt.data.size;
            if(!data.length) break;
        }
        return {data: options, size: size, error: [], has_error: false};
    }
    
    static parse(data)
    {
        if(!Array.isArray(data)) return {data: {}, 
                                         conn_type: 'unreliable', 
                                         size: 0,
                                         error: ['argument error'], 
                                         has_error: true};
        let data_parsed = {};
        const dsize = data.length;
        if(data.length < 4) return {data: data_parsed, 
                                    size: dsize,
                                    conn_type: 'unreliable', 
                                    error: ['data too short'], 
                                    has_error: true};
        
        data_parsed.version = data[0] >> 6;
        if(data_parsed.version != coap.version) 
            return {data: data_parsed, 
                    size: dsize,
                    conn_type: 'unreliable', 
                    error: ['invalid version'], 
                    has_error: true};
        
        const type_code = (data[0] >> 4) & 3;
        data_parsed.type = {
            code: type_code,
            value: Object.values(coap.type).find(t => t.code == type_code).value
        }
        
        const code_code = data[1], 
              v_code = Object.values(coap.code).find(t => t.code == code_code);
        data_parsed.code = {
            code: code_code,
            value: v_code ? v_code.value : null
        }
        
        data_parsed.mid = {
            data: data.slice(2, 4)
        }
        data_parsed.mid.value = (data_parsed.mid.data[0] << 8) | data_parsed.mid.data[1];
        
        data_parsed.token_len = data[0] & 0x0F;
        if(data_parsed.token_len > 8) 
            return {data: data_parsed, 
                    size: dsize,
                    conn_type: 'unreliable', 
                    error: ['invalid token size'], 
                    has_error: true};
        
        if(data.length < (4 + data_parsed.token_len)) 
            return {data: data_parsed, 
                    size: dsize,
                    conn_type: 'unreliable', 
                    error: ['data too short'], 
                    has_error: true};
        data_parsed.token = data_parsed.token_len ? data.slice(4, 4 + data_parsed.token_len) : [];
        
        if(data.length > (4 + data_parsed.token_len))
        {
            data_parsed.options = message.parse_options(data.slice(4 + data_parsed.token_len));
            if(data_parsed.options.has_error)
                return {data: data_parsed, 
                        size: dsize,
                        conn_type: 'unreliable', 
                        error: data_parsed.options.error, 
                        has_error: true};   

            if(data[4 + data_parsed.token_len + data_parsed.options.size] == coap.payload_marker)
                data_parsed.payload = data.slice(4 + data_parsed.token_len + data_parsed.options.size + 1);
            else
                data_parsed.payload = {data: [], error: [], has_error: false};
        }
        else
        {
            data_parsed.options = {data: [], size: 0, error: [], has_error: false};
            data_parsed.payload = {data: [], error: [], has_error: false};
        }
                    
        return {
            data: data_parsed,
            size: dsize,
            conn_type: 'unreliable',
            error: [],
            has_error: false
        }
    }
    
    static parse_reliable(data, setted_length = true)
    {
        if(!Array.isArray(data)) return {data: {}, 
                                         conn_type: 'reliable',
                                         setted_length: setted_length,
                                         size: 0,
                                         error: ['argument error'], 
                                         has_error: true};
        let data_parsed = {},
            dsize = data.length;
        if(data.length < 2) return {data: data_parsed, 
                                    size: dsize,
                                    conn_type: 'reliable', 
                                    setted_length: setted_length,
                                    error: ['data too short'], 
                                    has_error: true};
        
        let length = data[0] >> 4;
        if(!setted_length && length != 0)
            return {data: data_parsed, 
                    size: dsize,
                    setted_length: setted_length,
                    conn_type: 'reliable', 
                    error: ['invalid length'], 
                    has_error: true};
        
        let code_index = 1;
        if(setted_length)
        {
            switch(length)
            {
                case 13:
                    data_parsed.length = 13 + data[1];
                    code_index = 2;
                    break;
                case 14:
                    data_parsed.length = 269 + ((data[1] << 8)|data[2]);
                    code_index = 3;
                case 15:
                    data_parsed.length = 65805 + ((data[1] << 16)|(data[2] << 8)|data[1]);
                    code_index = 4;
                default:
                    data_parsed.length = length;
                    break;
            }
        }
        else
            data_parsed.length = 0;
        
        data_parsed.token_len = data[0] & 0x0F;
        if(data_parsed.token_len > 8) 
            return {data: data_parsed, 
                    size: dsize,
                    setted_length: setted_length,
                    conn_type: 'reliable', 
                    error: ['invalid token size'], 
                    has_error: true};
        
        const header_size = 1 + code_index + data_parsed.token_len;
        dsize = setted_length ? (data_parsed.length + header_size) : data.length;
        const code_code = data[code_index], 
              v_code = coap.code_by_code(code_code);
        data_parsed.code = {
            code: code_code,
            value: v_code ? v_code.value : null
        }
        
        if(data.length < header_size) 
            return {data: data_parsed, 
                    size: dsize,
                    header_size: header_size,
                    setted_length: setted_length,
                    conn_type: 'reliable', 
                    error: ['data too short'], 
                    has_error: true};
        data_parsed.token = data_parsed.token_len ? data.slice(header_size - data_parsed.token_len, header_size) : [];
        
        if(dsize > header_size)
        {
            data_parsed.options = message.parse_options(data.slice(header_size));
            if(data_parsed.options.has_error)
                return {data: data_parsed, 
                        size: dsize,
                        header_size: header_size,
                        setted_length: setted_length,
                        conn_type: 'reliable', 
                        error: data_parsed.options.error, 
                        has_error: true};   

            if(data[header_size + data_parsed.options.size] == coap.payload_marker)
                data_parsed.payload = data.slice(header_size + data_parsed.options.size + 1);
            else
                data_parsed.payload = {data: [], error: [], has_error: false};
        }
        else
        {
            data_parsed.options = {data: [], size: 0, error: [], has_error: false};
            data_parsed.payload = {data: [], error: [], has_error: false};
        }
                    
        return {
            data: data_parsed,
            size: dsize,
            header_size: header_size,
            setted_length: setted_length,
            conn_type: 'reliable',
            error: [],
            has_error: false
        }
    }
}

//export class option{
message.option = option;