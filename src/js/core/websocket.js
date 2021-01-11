import {Event_Emitter} from '../libs/event_emitter.js';
import {validate_domain_name, validate_ipv4_addr, validate_port} from '../helper/helper_types.js';
import {is_empty} from '../helper/object_op.js';

export const Websocket_Events = {
    CONNECT_ARGS_ERROR: 'arguments error',
    CONNECT_ERROR: 'connect error',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    RECEIVED_MESSAGE: 'received message',
    CLOSE: 'close',
    ERROR: 'error'
}

//https://tools.ietf.org/html/rfc6455#section-11.7
const Websocket_Close_Reason = {
    1000: 'Normal Closure',
    1001: 'Going Away',
    1002: 'Protocol error',
    1003: 'Unsupported Data',
    /* 1004: Reserved, */
    1005: 'No Status Rcvd',
    1006: 'Abnormal Closure',
    1007: 'Invalid frame payload data',
    1008: 'Policy Violation',
    1009: 'Message Too Big',
    1010: 'Mandatory Ext.',
    1011: 'Internal Server Error',
    1015: 'TLS handshake'
};

export class My_Websocket extends Event_Emitter
{
    constructor(){
        super();
        this._socket = null;
        this._addr = null;
        this._opt = {};
    }
    
    open(addr, port, protocol, opt = {})
    {
        let error = {};
        
        addr = addr.trim();
        if(!validate_domain_name(addr) && !validate_ipv4_addr(addr))
            error.addr = addr;

        if(!validate_port(port))
            error.port = port;
        
        if(protocol != "ws" && protocol != 'wss')
            error.protocol = protocol;
            
        if(!is_empty(error))
        {
            this.emit(Websocket_Events.CONNECT_ARGS_ERROR, error);
            return;
        }

        this._addr = `${protocol}://${addr}:${port}`;
        this._socket = new WebSocket(this._addr);
        this._opt = opt;
        
        this._register_events();
        this.emit(Websocket_Events.CONNECTING, this);  
    }
    
    addr(){
        return this._addr;
    }
    
    is_open(){
        return this._socket != null;
    }
    
    options()
    {
        return this._opt;
    }
    
    close(){
        this._socket.close();
    }
    
    send(data){
        this._socket.send(data);
    }
        
    _register_events()
    {
        this._socket.onopen = this._on_open.bind(this);
        this._socket.onmessage = this._on_message.bind(this);
        this._socket.onclose = this._on_close.bind(this);
        this._socket.onerror = this._on_error.bind(this);
    }
        
    _on_open(event)
    {
        this._socket.binaryType = "arraybuffer";    
        this.emit(Websocket_Events.CONNECTED, event);
    }
    
    _on_message(e)
    {
        this.emit(Websocket_Events.RECEIVED_MESSAGE, e.data);
    }
    
    _on_close(event)
    {
        let close_arg = {
            ev: event,
            addr: this._addr,
            reason: event.reason,
            code: event.code,
            message: Websocket_Close_Reason.hasOwnProperty(event.code) ? 
                                Websocket_Close_Reason[`${event.code}`] : 'Undefined'
        }
        this.emit(Websocket_Events.CLOSE, close_arg);
        this._socket = null;
//        this._app.disable_apps();
    }
        
    _on_error(error)
    {
        this.emit(Websocket_Events.ERROR, error);
        error.preventDefault();
    }
}