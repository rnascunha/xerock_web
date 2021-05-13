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

export const Data_Type = {
    text: { 
        value: 'text', name: 'Text', long_name: 'Text',
        to: Byte_Array_String.to,
        to_arr: Byte_Array_String.to,
        from: Byte_Array_String.from, 
        num_bytes: Byte_Array_String.num_bytes, 
        is_valid_char: Byte_Array_String.is_ascii_char,
        clear_invalid_char: string => string
    },
    hex: {
        value: 'hex', name: 'Hexa', long_name: 'Hexadecimal',
        to: Byte_Array_Hex.to, 
        to_arr: Byte_Array_Hex.to_arr,
        from: Byte_Array_Hex.from, 
        num_bytes: Byte_Array_Hex.num_bytes, 
        is_valid_char: Byte_Array_Hex.is_hex_char,
        clear_invalid_char: Byte_Array_Hex.clear_no_hex_char
    },
    binary: {
        value: 'binary', name: 'Binary', long_name: 'Binary',
        to: Byte_Array_Binary.to, 
        to_arr: Byte_Array_Binary.to_arr,
        from: Byte_Array_Binary.from, 
        num_bytes: Byte_Array_Binary.num_bytes, 
        is_valid_char: Byte_Array_Binary.is_binary_char,
        clear_invalid_char: Byte_Array_Binary.clear_no_binary_char
    },
    int8: {
        value: 'int8', name: 'Interger8', long_name: 'Interger8',
        to: Byte_Array_Int8.to, 
        to_arr: Byte_Array_Int8.to_arr,
        from: Byte_Array_Int8.from, 
        num_bytes: Byte_Array_Int8.num_bytes, 
        is_valid_char: Byte_Array_Int8.is_digit_char,
        clear_invalid_char: Byte_Array_Binary.clear_no_digit_char
    },
    uint8: {
        value: 'uint8', name: 'UInterger8', long_name: 'Unsigned Interger8',
        to: Byte_Array_UInt8.to, 
        to_arr: Byte_Array_UInt8.to_arr,
        from: Byte_Array_UInt8.from, 
        num_bytes: Byte_Array_UInt8.num_bytes, 
        is_valid_char: Byte_Array_UInt8.is_digit_char,
        clear_invalid_char: Byte_Array_UInt8.clear_no_digit_char
    },
    int16le: {
        value: 'int16le', name: 'Interger16LE', long_name: 'Interger16 little endian',
        to: (data, opt ={}) => Byte_Array_Int16.to(data, true, opt),
        to_arr: (data, opt ={}) => Byte_Array_Int16.to_arr(data, true, opt),
        from: (data, opt ={}) => Byte_Array_Int16.from(data, true, opt), 
        num_bytes: Byte_Array_Int16.num_bytes, 
        is_valid_char: Byte_Array_Int16.is_digit_char,
        clear_invalid_char: Byte_Array_Int16.clear_no_digit_char
    },
    int16be: {
        value: 'int16be', name: 'Interger16BE', long_name: 'Interger16 big endian',
        to: (data, opt ={}) => Byte_Array_Int16.to(data, false, opt),
        to_arr: (data, opt ={}) => Byte_Array_Int16.to_arr(data, false, opt),
        from: (data, opt ={}) => Byte_Array_Int16.from(data, false, opt), 
        num_bytes: Byte_Array_Int16.num_bytes, 
        is_valid_char: Byte_Array_Int16.is_digit_char,
        clear_invalid_char: Byte_Array_Int16.clear_no_digit_char
    },
    uint16le: {
        value: 'uint16le', name: 'UInterger16LE', long_name: 'Unsigned Interger16 little endian',
        to: (data, opt ={}) => Byte_Array_UInt16.to(data, true, opt),
        to_arr: (data, opt ={}) => Byte_Array_UInt16.to_arr(data, true, opt),
        from: (data, opt ={}) => Byte_Array_UInt16.from(data, true, opt), 
        num_bytes: Byte_Array_UInt16.num_bytes, 
        is_valid_char: Byte_Array_UInt16.is_digit_char,
        clear_invalid_char: Byte_Array_UInt16.clear_no_digit_char
    },
    uint16be: {
        value: 'uint16be', name: 'UInterger16BE', long_name: 'Unsigned Interger16 big endian',
        to: (data, opt ={}) => Byte_Array_UInt16.to(data, false, opt),
        to_arr: (data, opt ={}) => Byte_Array_UInt16.to_arr(data, false, opt),
        from: (data, opt ={}) => Byte_Array_UInt16.from(data, false, opt), 
        num_bytes: Byte_Array_UInt16.num_bytes, 
        is_valid_char: Byte_Array_UInt16.is_digit_char,
        clear_invalid_char: Byte_Array_UInt16.clear_no_digit_char
    },
    int32le: {
        value: 'int32le', name: 'Interger32LE', long_name: 'Interger32 little endian',
        to: (data, opt ={}) => Byte_Array_Int32.to(data, true, opt),
        to_arr: (data, opt ={}) => Byte_Array_Int32.to_arr(data, true, opt),
        from: (data, opt ={}) => Byte_Array_Int32.from(data, true, opt), 
        num_bytes: Byte_Array_Int32.num_bytes, 
        is_valid_char: Byte_Array_Int32.is_digit_char,
        clear_invalid_char: Byte_Array_Int32.clear_no_digit_char
    },
    int32be: {
        value: 'int32be', name: 'Interger32BE', long_name: 'Interger32 big endian',
        to: (data, opt ={}) => Byte_Array_Int32.to(data, false, opt),
        to_arr: (data, opt ={}) => Byte_Array_Int32.to_arr(data, false, opt),
        from: (data, opt ={}) => Byte_Array_Int32.from(data, false, opt), 
        num_bytes: Byte_Array_Int32.num_bytes, 
        is_valid_char: Byte_Array_Int32.is_digit_char,
        clear_invalid_char: Byte_Array_Int32.clear_no_digit_char
    },
    uint32le: {
        value: 'uint32le', name: 'UInterger32LE', long_name: 'Unsigned Interger32 little endian',
        to: (data, opt ={}) => Byte_Array_UInt32.to(data, true, opt),
        to_arr: (data, opt ={}) => Byte_Array_UInt32.to_arr(data, true, opt),
        from: (data, opt ={}) => Byte_Array_UInt32.from(data, true, opt), 
        num_bytes: Byte_Array_UInt32.num_bytes, 
        is_valid_char: Byte_Array_UInt32.is_digit_char,
        clear_invalid_char: Byte_Array_UInt32.clear_no_digit_char
    },
    uint32be: {
        value: 'uint32be', name: 'UInterger32BE', long_name: 'Unsigned Interger32 big endian',
        to: (data, opt ={}) => Byte_Array_UInt32.to(data, false, opt),
        to_arr: (data, opt ={}) => Byte_Array_UInt32.to_arr(data, false, opt),
        from: (data, opt ={}) => Byte_Array_UInt32.from(data, false, opt), 
        num_bytes: Byte_Array_UInt32.num_bytes, 
        is_valid_char: Byte_Array_UInt32.is_digit_char,
        clear_invalid_char: Byte_Array_UInt32.clear_no_digit_char
    },
    int64le: {
        value: 'int64le', name: 'Interger64LE', long_name: 'Interger64 little endian',
        to: (data, opt ={}) => Byte_Array_Int64.to(data, true, opt),
        to_arr: (data, opt ={}) => Byte_Array_Int64.to_arr(data, true, opt),
        from: (data, opt ={}) => Byte_Array_Int64.from(data, true, opt), 
        num_bytes: Byte_Array_Int64.num_bytes, 
        is_valid_char: Byte_Array_Int64.is_digit_char,
        clear_invalid_char: Byte_Array_Int64.clear_no_digit_char
    },
    int64be: {
        value: 'int64be', name: 'Interger64BE', long_name: 'Interger64 big endian',
        to: (data, opt ={}) => Byte_Array_Int64.to(data, false, opt),
        to_arr: (data, opt ={}) => Byte_Array_Int64.to_arr(data, false, opt),
        from: (data, opt ={}) => Byte_Array_Int64.from(data, false, opt), 
        num_bytes: Byte_Array_Int64.num_bytes, 
        is_valid_char: Byte_Array_Int64.is_digit_char,
        clear_invalid_char: Byte_Array_Int64.clear_no_digit_char
    },
    uint64le: {
        value: 'uint64le', name: 'UInterger64LE', long_name: 'UInterger64 little endian',
        to: (data, opt ={}) => Byte_Array_UInt64.to(data, true, opt),
        to_arr: (data, opt ={}) => Byte_Array_UInt64.to_arr(data, true, opt),
        from: (data, opt ={}) => Byte_Array_UInt64.from(data, true, opt), 
        num_bytes: Byte_Array_UInt64.num_bytes, 
        is_valid_char: Byte_Array_UInt64.is_digit_char,
        clear_invalid_char: Byte_Array_UInt64.clear_no_digit_char
    },
    uint64be: {
        value: 'uint64be', name: 'UInterger64BE', long_name: 'UInterger64 big endian',
        to: (data, opt ={}) => Byte_Array_UInt64.to(data, false, opt),
        to_arr: (data, opt ={}) => Byte_Array_UInt64.to_arr(data, false, opt),
        from: (data, opt ={}) => Byte_Array_UInt64.from(data, false, opt), 
        num_bytes: Byte_Array_UInt64.num_bytes, 
        is_valid_char: Byte_Array_UInt64.is_digit_char,
        clear_invalid_char: Byte_Array_UInt64.clear_no_digit_char
    }
}
Object.freeze(Data_Type);

export const Escape_Characters = {
    0: {value: '0', hex: 0x00, name: 'Null'},
    a: {value: 'a', hex: 0x07, name: 'Alert'},
    b: {value: 'b', hex: 0x08, name: 'Backspace'},
    e: {value: 'e', hex: 0x1B,	name: 'Escape'},
    f: {value: 'f', hex: 0x0C,	name: 'Formfeed'},
    n: {value: 'n', hex: 0x0A, name: 'Newline'},
    r: {value: 'r', hex: 0x0D, name: 'Carriage Return'},
    t: {value: 't', hex: 0x09, name: 'Horizontal Tab'},
    v: {value: 'v', hex: 0x0B, name: 'Vertical Tab'},
    '\\': {value: '\\', hex: 0x5C, name: 'Backslash'}
}

export const Error_Type = {
    UNKNOW_TYPE: {code: 1, message: 'Unknow type'},
    OUT_OF_BOUND: {code: 2, message: 'Value out of bound'},
    WRONG_ARGUMENT: {code: 3, message: 'Wrong argument'},
    INVALID_CHAR: {code: 4, message: 'Invalid character'},
    INVALID_SIZE: {code: 5, message: 'Invalid size to type'}
}