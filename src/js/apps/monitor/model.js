import {App_Daemon_Template} from '../../core/app/app_template.js';
import {App_List} from '../app_list.js';
import {Message_Info} from '../../core/types.js';
import {Control_Type} from '../../core/libs/message_factory.js';
import {add_zero} from '../../helper/util.js';
import {Monitor_Events, Monitor_Limits, Monitor_Commands} from './types.js';

export class Monitor_App_Model extends App_Daemon_Template
{
    constructor(server)
    {
        super(App_List.MONITOR.name, server, App_List.MONITOR.long_name);
        
        this._app_id = server.id();
        
        this.on(Monitor_Events.SEND, args => this.monitor(args));
        this.on(Monitor_Events.CANCEL, args => this.cancel(args));
    }
    
    id(id){
        return this._app_id;
    }
    
    enable(en){
    }
    
    monitor(data){
        if(!data.hasOwnProperty('sample')){
            this.emit(Monitor_Events.ERROR, 'Sample time must be provided');
            return;
        }
        
        let sample = parseInt(data.sample);
        if(!Number.isInteger(sample) || (sample < Monitor_Limits.min || sample > Monitor_Limits.max)){
            this.emit(Monitor_Events.ERROR, 'Sample time must be a value from 1 to 10');
            return;
        }
        
        let cont = data.cont;
        if(!data.hasOwnProperty('cont')) cont = false;
        
        this.send_control(Control_Type.status.value, {type: Monitor_Commands.SET, sample_time: sample, cont: cont});
    }
    
    cancel(){
        this.send_control(Control_Type.status.value, {type: Monitor_Commands.CANCEL});
    }
        
    message_info(type_info, message, opt)
    {
        switch(type_info){
            case Message_Info.ID: 
            case Message_Info.FROM:
                return this._app_id;
            case Message_Info.ID_STRING:
            case Message_Info.FROM_STRING:
                return `${this._app_id}`;
            case Message_Info.DATA_OUTPUT:
                return this._format_data_message(message.data);
        }
        return null;
    }

    _format_control_status(new_message, message)
    {
        if(message.data.type == Monitor_Commands.SET)
            new_message.data = ['sample_time=' + message.data.sample_time, 'cont=' + message.data.cont];
        else new_message.data = [Monitor_Commands.CANCEL];
    }
    
    _format_data_message(message)
    {
        return [`threads=${message.n_threads}
cpu time/%=${Number(message.cpu_time).toFixed(2)}s/${Number(message.cpup).toFixed(1)}%
overall cpu time/%=${Number(message.cpu_time_all).toFixed(2)}s/${Number(message.cpup_all).toFixed(1)}%
ram memory/%/peak=${Number(message.mem_kb)}kb/${Number(message.memp).toFixed(1)}%/${Number(message.peak_mem)}kb
virtual memory/peak=${Number(message.vm_mem_kb)}kb/${Number(message.peak_vm_mem)}kb
uptime=${this._format_uptime(message.up)}`];
    }
   
//    _format_data_message(message)
//    {
//        let str = `<span title="number of threads">${message.n_threads}</span>|`
//        str += `<span title="cpu time(%)/overall cpu time(%)">
//${Number(message.cpu_time).toFixed(2)}s(${Number(message.cpup).toFixed(1)}%)/${Number(message.cpu_time_all).toFixed(2)}s(${Number(message.cpup_all).toFixed(1)}%)</span>|`
//        str += `<span title="ram memory (%/peak ram memory)/virtual memory(peak virtual memory)">${Number(message.mem_kb)}Kb(${Number(message.memp).toFixed(1)}%/${Number(message.peak_mem)}kb)/${Number(message.vm_mem_kb)}kb(${Number(message.peak_vm_mem)}kb)</span>`
//        str += `|<span title=uptime>${this._format_uptime(message.up)}</span>`;
//        
//        return [str];
//    }

    _format_uptime(uptime){
        let hour = Math.floor(uptime / 3600), 
            minute = Math.floor((uptime % 3600) / 60),
            seconds = Math.floor((uptime % 3600) % 60);
        
        return `${add_zero(hour,2)}:${add_zero(minute,2)}:${add_zero(seconds,2)}`;
    }
}