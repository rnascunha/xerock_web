import {App_ID_Template} from '../../core/id/id_template.js'

export class TCP_Client_ID extends App_ID_Template{
    constructor(secure, remote, local, app)
    {
        super(local, app, secure + '://' +local.addr + ':' + local.port + '>' + remote.addr + ':' + remote.port);
        
        this._secure = secure;
        this._local = local;
        this._remote = remote;
    }
    
    get secure(){ return this._secure; }
    get local(){ return this._local; }
    get remote(){ return this._remote; }
        
    make_value(full = true)
    {
        let n = `${this._local.addr}:${this._local.port}`;
        
        return full ? `${this._secure}://${n}` : n;
    }
    
    make_name(full = true)
    {
        
    }
        
    compare(secure, local, remote)
    {
        return (this._secure === secure) 
                && (this._local.addr === local.addr && this._local.port === local.port)
                && (this._remote.addr === remote.addr && this._remote.port === remote.port);
    }
    
    compare_ids(id)
    {
        if(id instanceof App_ID_Template)
        {
            return this._local.addr == id.local.addr &&
                    this._local.port == id.local.port;
        }
        return this._local.addr === id.addr && this._local.port === id.port;
    }
    
    compare_message_id(message, compare_exactly = false)
    {
        return this._local.addr == message.id.addr && this._local.port == message.id.port;
    }
}