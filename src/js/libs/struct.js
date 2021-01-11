import {Byte_Array} from './byte_array/byte_array.js';

export class Struct
{
    static split(data_struct, data)
    {
        if(!(data_struct instanceof Array && 
                       (data instanceof Array || 
                        data instanceof Uint8Array)))
            return {error: true, message_err: '"data_struct" must be a array'};

        let err = {error: false}, new_data_struct = [];
        //Creating structure
        data_struct.forEach(dt => {
            if(typeof dt == 'object'){
                if(!dt.hasOwnProperty('data_type')){
                    err = {error: true, message_err: 'Invalid data_struct'};
                    return;
                }
                if(!dt.hasOwnProperty('size'))
                    dt.size = 1;
                new_data_struct.push(dt);
            } else
                new_data_struct.push({data_type: dt, size: 1});
        });
        if(err.error == true) return err;
        
        //Checking size
        let size = 0;
        new_data_struct.forEach(dt => {
            size += Byte_Array.num_bytes(dt.data_type) * dt.size; 
        });
        if(size > data.length)
            return {error: true, message_err: 'Data size too small'};
        
        let dc = new Byte_Array(),
            new_data = [];
        new_data_struct.forEach(dt => {
            if(!dc.raw(data.slice(0, Byte_Array.num_bytes(dt.data_type) * dt.size)).length){
                err = {error: true, message_err: 'Invalid data'};
                return;
            }
            new_data.push(dc.raw());
            data = data.slice(Byte_Array.num_bytes(dt.data_type) * dt.size);
        });
        if(err.error == true) return err;

        return {data: new_data, rest: data, data_struct: new_data_struct, error: false};
    }

    static make(data_struct, data, struct = {})
    {
        let split = Struct.split(data_struct, data);
        if(split.error == true) return split;

        let new_data = struct,
            dc = new Byte_Array(),
            err = {error: false};
        split.data_struct.forEach((dt, idx) => {
            let name = idx, opt = {};
            if(dt.hasOwnProperty('name')) name = dt.name;
            if(dt.hasOwnProperty('opt')) opt = dt.opt;

            dc.raw(split.data[idx]);        
            new_data[name] = dc.to(dt.data_type, opt);
        });
        if(err.error == true) return err;

        return {data: new_data, rest: split.rest, error: false};
    }
}