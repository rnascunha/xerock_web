import {columns, columns_default} from '../libs/select/types.js';
import {Output_Type} from './types.js';
import {Select} from '../libs/select/controller.js';
import {Date_Time_Format, DATETIME_FORMAT, TIME_PRECISION} from '../../time_format.js';
import {convert_to_string_hex, convert_to_string_bin, convert_to_string} from '../../helper/helper_types.js';
import {Filter} from '../libs/filter/controller.js';
import {Byte_Array} from '../../libs/byte_array/byte_array.js';
import {Message_Type, 
        Control_Type, 
        Message_Direction} from '../libs/message_factory.js';

const converter = new Byte_Array();

export function format_output(data, format)
{
    //Check if type of data is string and output should be a string, do nothing
    if((format === Output_Type.NONE.value || 
        format === Output_Type.text.value) &&
        typeof data === 'string') return { data: data, size: data.length, type: Output_Type.text.value};
    
    if(typeof data === 'string')
        converter.from(data, Output_Type.text.value);
    else if(Array.isArray(data))
        converter.raw(data);
    else if(typeof data === 'object')
        converter.raw(Object.values(data))
    else{
        console.error('Output data not supported');
        return { data: '', size: -1, type: Output_Type.NONE.value};
    }
    
    let set_format = format === Output_Type.NONE.value ? Output_Type.hex.value : format;
    return {data: converter.to(set_format), size: converter.size(), type: set_format};
}

const default_options = {
    time_format:  DATETIME_FORMAT.TIME.value,
    time_precision: TIME_PRECISION.MILISECONDS.value,
    data_format: Output_Type.NONE.value,
    select: columns_default,
    stringify: false,
    stringify_sep: ' '
}

export function format_data(data, options = {})
{
    let new_data = {};
    
    options = {...default_options, ...options};
    options.select.forEach(s => {
        switch(s)
        {
            case 'file':
            case 'mid':
            case 'sid':
            case 'smid':
            case 'uid':
            case 'sname':
            case 'saddr':
            case 'app':
            case 'session':
                new_data[s] = s in data ? data[s] : '';
            case 'from':
                new_data.from = 'from_str' in data ? data.from_str : '';
            break;
            case 'type':
                new_data.type = Message_Type[data.type].name;
            break;
            case 'dir':
                new_data.dir = Message_Direction[data.dir].name;
            break;
            case 'time':
                new_data.time = Date_Time_Format.format(data.time, options.time_format, options.time_precision);
            break;
            case 'id':
                new_data.id = 'id_str' in data ? data.id_str :
                    ('ctype' in data ? Control_Type[data.ctype].name : '');
            break;
            case 'size':
                new_data.size = '';
                break;
            case 'payload':
                if(!('data' in data)){
                    new_data.payload = '';
                } else if(!(data.data instanceof Array)){
                    new_data.payload = data.data;
                } else {
                    let did = 'data_field' in data ? data.data_field : -1;
                    let arr = [];
                    data.data.forEach((dt, idx) => {
                        if(idx != did)
                            arr.push(dt);
                        else {
                            let temp = format_output(dt, options.data_format);
                            new_data.size = temp.size;
                            new_data.payload_type = temp.type;
                            arr.push(temp.data);
                        }
                    });
                    new_data.payload = !options.stringify ? arr : arr.join(options.stringify_sep);
                }
            break;
            default:
            break;
        }
    });
    
    return new_data;
}

export function format_all_data(data, options = {}){
    let new_data = [],
        filter = options.filter || {};
    
    data.forEach(d => {
        if(Filter.filter(filter, d.data))
            new_data.push(format_data(d.data, options))
    });
    
    return new_data;
}

