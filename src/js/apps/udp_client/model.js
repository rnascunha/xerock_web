import {App_Daemon_Template} from '../../core/app/app_template.js';
import {App_List} from '../app_list.js';
import {Control_Type} from '../../core/libs/message_factory.js';
import {Message_Info} from '../../core/types.js';
//import {copy} from '../../helper/object_op.js';
import {UDP_Client_ID} from './id.js';
import {validate_ipv4_addr, validade_url} from '../../helper/helper_types.js';
import {UDP_Client_Port, 
        UDP_Client_Secure, 
        UDP_Client_Events, 
        UDP_Client_Keepalive,
        UDP_Client_Error} from './types.js';

export class UDP_Client_Model extends App_Daemon_Template
{
    constructor(server)
    {
        super(App_List.UDP_CLIENT.name, server, App_List.UDP_CLIENT.long_name);
        this._list = {};
    }
    
    enable(en)
    {
        if(en) this.send_status();
    }
    
    list()
    {
        return Object.assign({}, this._list);
    }
    
    send_status()
    {
        this.send_control(Control_Type.status.value);
    }
        
    make_error(error, what = null)
    {
        if(what)
            return {error: error, what: what};
        
        return {error: error};
    }
    
    open(conn_arg)
    {
        conn_arg.addr = conn_arg.addr.trim();
        if(!validate_ipv4_addr(conn_arg.addr) && !validate_domain_name(conn_arg.addr))
        {
            this.emit(UDP_Client_Events.ERROR, this.make_error(UDP_Client_Error.INVALID_ADDR, conn_arg.addr));
            return;
        }
        
        conn_arg.port = +conn_arg.port;
        if(typeof conn_arg.port != 'number' ||  conn_arg.port < UDP_Client_Port.min || conn_arg.port > UDP_Client_Port.max)
        {
            this.emit(UDP_Client_Events.ERROR, this.make_error(UDP_Client_Error.INVALID_PORT, conn_arg.port));
            return;
        }
        
        this.send_control(Control_Type.open.value, conn_arg);
    }
    
    close(client)
    {
        this.send_control(Control_Type.close.value, {addr: client.local.addr, port: client.local.port});
    }
            
    send_data(data, id, to, opt)
    {        
        return {local: {addr: id.local.addr, port: id.local.port}, data: data};
    }
    
    message_info(type_info, message, opt)
    {
        switch(type_info)
        {
            case Message_Info.ID:
                return message.data.local;
            case Message_Info.ID_STRING:
                return `${message.data.local.addr}:${message.data.local.port}`;
            case Message_Info.FROM:
                {
                    let client = this.get_id(message.data.local);
                    return client ? client.remote : null;
                }
            case Message_Info.FROM_STRING:
                {
                    let client = this.get_id({addr: message.data.local.addr, port: message.data.local.port});
                    return client ? `${client.remote.addr}:${client.remote.port}` : null;
                }
            case Message_Info.DATA_OUTPUT:
                return [message.data.data];
            case Message_Info.DATA_FIELD:
                return 0;
        }
        return null;
    }
    
    get_id(local)
    {
        return this._list[`${local.addr}:${local.port}`];
    }
        
    _control_status(message)
    {
        let clients = message.data;
        
        if(!Array.isArray(clients)) return;
        
        let new_list = {};
        clients.forEach(client => {
            let c = this.get_id(client.local);
            if(c) 
                new_list[`${c.local.addr}:${c.local.port}`] = c;
            else
                new_list[`${client.local.addr}:${client.local.port}`] = new UDP_Client_ID(client.remote, client.local, this);
        });
    
        this.update_ids(Object.values(new_list));    
        this._list = new_list;
        this.emit(UDP_Client_Events.STATUS, this._list);
    }
    
    _control_error(message)
    {
        this.emit(UDP_Client_Events.SERVER_ERROR, message);
    }
    
    _control_close(message)
    {
    }
    
    _format_control_status(new_message, message)
    {
        if('data' in message && Array.isArray(message.data))
        {
            message.data.forEach(client => { new_message.data.push(`${client.local.addr}:${client.local.port}>` + `${client.remote.addr}:${client.remote.port}`);
            });
        }
    }
        
    _format_control_open(new_message, message)
    {
        let client = message.data;
        new_message.data.push(`${client.addr}:${client.port}`);
    }
    
    _format_control_close(new_message, message)
    {
         new_message.data.push(`${message.data.addr}:${message.data.port}`);
    }
}