import {App_Daemon_Template} from '../../core/app/app_template.js';
import {Control_Type} from '../../core/libs/message_factory.js';
import {Message_Info} from '../../core/types.js';
import {App_List} from '../app_list.js';
import {Serial_ID, serial_short_notation} from './serial.js';
import {Serial_Events} from './define.js';

export class Serial_App_Model extends App_Daemon_Template
{
    constructor(server)
    {
        super(App_List.SERIAL.name, server, App_List.SERIAL.long_name);
        this._serial_list = [];
    }
        
    list(){
        return Object.assign([], this._serial_list);
    }
    
    enable(en)
    {
        if(en) this.serial_status();
    }
    
    serial_status()
    {
        this.send_control(Control_Type.status.value);
    }
    
    open(port_conf)
    {
        this.send_control(Control_Type.open.value, {
            port: port_conf.port,
            baudrate: port_conf.baudrate,
            char_size: port_conf.char_size,
            parity: port_conf.parity,
            stopbit: port_conf.stopbit,
            flow_control: port_conf.flow_control,
            fc_start: port_conf.fc_start,
            fc_stop: port_conf.fc_stop
        });
    }
    
    close(port)
    {
        this.send_control(Control_Type.close.value, { port: port});
    }
    
    send_data(data, id, to, opt)
    {
        return {port: id.value(), data: data};
    }

    message_info(type_info, message, opt)
    {
        switch(type_info){
            case Message_Info.ID: 
            case Message_Info.ID_STRING:
            case Message_Info.FROM:
            case Message_Info.FROM_STRING:
                return message.data.port;
            case Message_Info.DATA_OUTPUT:
                return [message.data.data];
            case Message_Info.DATA_FIELD:
                return 0;
        }
        return null;
    }
    
    _control_status(message)
    {            
        this._serial_list = [];
        message.data.ports.forEach(port => {
            let id = new Serial_ID(port.port, this, port.open, port.config);
            this._serial_list.push(id);
        });
        this._serial_list.sort(function(a, b){ return (a.name() > b.name() ? 1 : (a.name() < b.name() ? -1 : 0)); });        
        this.update_ids(this._serial_list.filter(port => port.is_open()));
        
        this.emit(Serial_Events.STATUS, message.data.ports);
    }
    
    _format_control_status(new_message, message)
    {
        let data = [];
        if(message.hasOwnProperty('data') && message.data.ports.length != 0)
            message.data.
                    ports.forEach(p => 
                                       data.push(`${p.port}(${p.open ? serial_short_notation(p.config, false) : 'closed'})`));
        new_message.data = data;
    }
    
    _format_control_open(new_message, message){
        new_message.data = message.data.port + ' ' + serial_short_notation(message.data);
    }
    
    _format_control_close(new_message, message){
        new_message.data = [message.data.port];
    }
}