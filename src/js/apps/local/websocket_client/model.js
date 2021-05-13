import {App_Local_Template} from '../../../core/app/app_template.js';
import {Events} from './types.js';
import {WebSocket_Client_ID} from './id.js';
import {App_List} from '../../app_list.js';
import {Message_Info} from '../../../core/types.js';
import {validate_domain_name, validate_ipv4_addr, validate_port} from '../../../helper/helper_types.js';
import {is_empty} from '../../../helper/object_op.js';
import {Control_Type, Message_Direction} from '../../../core/libs/message_factory.js';

function make_error(error)
{
    let e = 'ERROR:';
    
    Object.keys(error).forEach(err => {
        e += ` ${err}=${error[err]}`;
    });
    
    return e;
}

export class WebSocket_Client_Model extends App_Local_Template
{
    constructor(server)
    {
        super(App_List.WEBSOCKET_CLIENT.name, server, App_List.WEBSOCKET_CLIENT.long_name);
        
        this._sockets = [];        
    }
     
    sockets(){ return this._sockets; }
    static support(){ return 'WebSocket' in window; }
        
    send_data(data, id, to, opt)
    {
        id.send_socket(data);
        return {addr: id.addr(), data: data};
    }
            
    open(addr, port, secure)
    {
        let error = {};
        
        addr = addr.trim();
        if(!validate_domain_name(addr) && !validate_ipv4_addr(addr))
            error.addr = addr;

        if(!validate_port(port))
            error.port = port;
        
        if(secure != "ws" && secure != 'wss')
            error.secure = secure;
            
        if(!is_empty(error))
        {
            this.emit(Events.ERROR, make_error(error));
            return false;
        }

        let addr_ = `${secure}://${addr}:${port}`;
        if(this._sockets.some(ids => ids.addr() === addr_))
        {
            this.emit(Events.ERROR, `${addr_} already connected`);
            return false;
        }
        
        this.send_control(Control_Type.open.value, addr_);
        new WebSocket_Client_ID({addr: addr, port: port, secure: secure}, this);
        
        return true;
    }
    
    close(id)
    {
        this.send_control(Control_Type.close.value, id.addr());
        id.close();
    }
    
    opened(id)
    {
        this._sockets.push(id);
        this.update_ids(this.sockets());
        
        this.emit(Events.ERROR, '');
        this.emit(Events.ADD, id);
    }
    
    closed(id, reason = null)
    {
        this.control(Control_Type.close.value, id.addr());
        
        this._sockets = this._sockets.filter(id_ => id_ != id);
        this.update_ids(this.sockets());

        if(reason && reason.code != 1000) //1000 = Normal Closure
            this.emit(Events.ERROR, `${id.addr()}: ${reason.message}`);
        this.emit(Events.CLOSE);
    }
        
    socket_error(id, error)
    {
        this.control(Control_Type.error.value, `${id.addr()}: ${error}`);
    }
    
    message_info(type_info, message, opt)
    {
        switch(type_info){
            case Message_Info.ID: 
                return message.data.addr;
            case Message_Info.FROM:
                return this.server().addr();
            case Message_Info.ID_STRING:
//            case Message_Info.FROM_STRING:
                return `${message.data.addr}`;
            case Message_Info.FROM_STRING:
//            case Message_Info.ID_STRING:
                return this.server().name();
            case Message_Info.DATA_OUTPUT:
                return [message.data.data];
            case Message_Info.DATA_FIELD:
                return 0;
        }
        return null;
    }
    
    _format_control_close(new_message, message)
    {
        new_message.data = [(message.dir === Message_Direction.received.value ? 'closed ' : 'request ') + message.data ]
    }
    
    _format_control_open(new_message, message)
    {
        new_message.data = [message.data];
    }
    
    _format_control_error(new_message, message)
    {
        new_message.data = [message.data];
    }
}