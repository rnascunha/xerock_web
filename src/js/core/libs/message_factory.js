import {has_property} from '../../helper/helper.js';

export const Message_Type = {
    data: {value: 'data', name: 'data'},
    control: {value: 'control', name: 'control'}
}
Object.freeze(Message_Type);

export const Control_Type = {
    status: {value: 'status', name: 'status'},
    error: {value: 'error', name: 'error'},
    open: {value: 'open', name: 'open'},
    close: {value: 'close', name: 'close'},
    config: {value: 'config', name: 'config'},
    custom: {value: 'custom', name: 'custom'}
}
Object.freeze(Control_Type);

export const Message_Direction = {
    sent: {value: 'sent', name: '>>'},
    received: {value: 'received', name: '<<'}
}
Object.freeze(Message_Direction);

export function get_message_data(message)
{
    if('data_field' in message && message.data_field >= 0)
    {
        let data = message.data[message.data_field];
        if(typeof data === 'string' || 
           data instanceof Uint8Array) 
            return data;
        else if(Array.isArray(data)) 
            return (new Uint8Array(data));
        else if(typeof data === 'object')
            return new Uint8Array(Object.values(data));
    }
    
    return false;
}

//Microseconds
export function get_time()
{
    return parseInt(Date.now()) * 1000;
}

export class Message_Factory{
   
    static create(app, type, control, data)
    {
        let message = {};
                
        message.app = app;
        message.time = get_time();
        
        if(!has_property(Message_Type, type))
            return false;
        message.type = type;

        if(type == Message_Type.control.value)
        {
            if(!has_property(Control_Type, control))
                return false;
            
            message.ctype = control;
        }
        
        //Checking data
        if(data)
            message.data = data;
       
        return message;
    }
    
}
