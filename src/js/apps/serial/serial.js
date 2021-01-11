import {Serial_Parity, Serial_Stopbit, Serial_Flow_Control} from './define.js';
import {App_ID_Template} from '../../core/id/id_template.js';

export class Serial_ID extends App_ID_Template
{
    constructor(serial_port, app, is_open = false, config = {})
    {
        super(serial_port, app);
        this._is_open = is_open;
        this._config = config;
    }
    
    is_open()
    {
        return this._is_open;
    }
    
    config()
    {
        return this._config;
    }
    
    short_notation(fc = true)
    {
        if(!this.is_open()) return null;
        
        return serial_short_notation(this.config(), fc);
    }
    
    compare_message_id(message, compare_exactly = false)
    {
        return message.id === this.value();
    }    
}

export function serial_short_notation(config, fc = true)
{
    let str = `${config.baudrate}/${config.char_size}`;
        
    let parity = Object.values(Serial_Parity).find(p => p.value == config.parity);
    str += parity ? parity.short : '-';
    
    let stopbit = Object.values(Serial_Stopbit).find(s => s.value == config.stopbit);
    str += stopbit ? stopbit.short : '-';
    
    if(fc){
        let flowcontrol = Object.values(Serial_Flow_Control).find(fc => fc.value == config.flow_control);
        str += ' ' + (flowcontrol ? flowcontrol.short : '-');
    }
    
    return str;
}