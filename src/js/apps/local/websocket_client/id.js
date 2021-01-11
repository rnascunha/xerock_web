import {App_ID_Template} from '../../../core/id/id_template.js';
import * as Types from './types.js';

//https://tools.ietf.org/html/rfc6455#section-11.7
const close_reason = {
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

export class WebSocket_Client_ID extends App_ID_Template
{    
    constructor(addr, app)
    {
        let addr_str = `${addr.secure}://${addr.addr}:${addr.port}`;
        super(addr, app, addr_str);
        
        this._addr = addr_str;
        
        this._is_open = false;
        
        this._socket = new WebSocket(this._addr);
        this._register_events();
    }
        
    is_open(){ return this._is_open; }
    addr(){ return this._addr; }
    
    _register_events()
    {
        this._socket.onopen = this._on_open.bind(this);
        this._socket.onmessage = this._on_message.bind(this);
        this._socket.onclose = this._on_close.bind(this);
        this._socket.onerror = this._on_error.bind(this);
    }
    
    close(){
        this._socket.close();
    }
    
    send_socket(data)
    {
        this._socket.send(data);
    }
    
//    send(data)
//    {
//        this.app().send
//        this._socket.send(data);
//    }
        
    _on_open(event)
    {
        this._socket.binaryType = "arraybuffer";    
        this._is_open = true;
        this.app().opened(this);
    }
    
    _on_message(e)
    {
        this.app().received_data({addr: this.addr(), data: e.data});
    }
    
    _on_close(event)
    {
        this.app().closed(this, {
            addr: this._addr,
            reason: event.reason,
            code: event.code,
            message: event.code in close_reason ? 
                                close_reason[`${event.code}`] : 'Undefined'
        });
    }
        
    _on_error(error)
    {
        if(!this.is_open())
            this.app().socket_error(this, 'connect');
        else
            this.app().socket_error(this, 'socket');
    }
}
