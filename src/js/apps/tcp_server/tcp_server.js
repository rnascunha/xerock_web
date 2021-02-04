import {copy} from '../../helper/object_op.js';
import {App_ID_Template, ID_Types} from '../../core/id/id_template.js'

export class TCP_Server_ID extends App_ID_Template
{
    constructor(tcp_server, app, type, client = null)
    {
        let value = tcp_server.id();
        value.type = type;
        value.client = client ? client.id_str() : client;
        
        super(value, app, tcp_server.id_str(), type);
        
        this._server = tcp_server;
        this._client = client;
    }
    
    id()
    {
        return this._server.id();
    }
    
    name()
    {
        let str = `${this._name}`;
        switch(this.type())
        {
            case ID_Types.One2N:
                return str;
            case ID_Types.One2All:
                return `${str}:all`;
            case ID_Types.One2One:
                return `${str}>${this._client.name_id()}`;
            default:
        }
        console.assert(false, 'Wrong TCP_Server_ID type defined');
    }
    
//    full_name()
//    {
//        return `${this.server().id()}:${this.name()}`;
//    }
    
    to_clients(to = null)
    {
        switch(this.type())
        {
            case ID_Types.One2N:
                if(!to)
                    return this._server.selected_clients();
                return this._get_clients(to);
            case ID_Types.One2All:
                return this._server.clients();
            case ID_Types.One2One:
                return [this._client];
            default:
        }
        console.assert(false, 'Wrong TCP_Server_ID type defined');
    }
    
    clients()
    {
        return this._server.clients();
    }
    
    compare_ids(id)
    {
        if(id instanceof App_ID_Template){
            let comp = this._server.addr() == id._server.addr() && 
                this._server.port() == id._server.port() &&
                this.type() == id.type();
        
            if(!comp) return false;

            if(this.type() != ID_Types.One2One) return true;
            if(!id._client) return false;

            if(this._client.id_str() != id._client.id_str()) return false;

            return true;    
        }
        
        let comp = this._server.addr() == id.addr && 
                this._server.port() == id.port &&
                this.type() == id.type;
        
        if(!comp) return false;
        
        if(this.type() != ID_Types.One2One) return true;
        if(!id.client) return false;
        
        if(this._client.id_str() != id.client) return false;
        
        return true;
    }
    
    _get_clients(to)
    {
        if(!Array.isArray(to)) to = [to];
        
        let n_to = [];

        this._server.clients().forEach(client => {
           to.forEach(t => {
               if(client.is_equal(t.addr, t.port)) n_to.push(client);
           });
        });
        
        return n_to;
    }
    
    compare_message_id(message, compare_exactly = false)
    {
        let server = message.id;
        
        if(this._server.is_equal(server.addr, server.port))
        {
            if(!compare_exactly 
                || this.type() == ID_Types.One2N
                || this.type() == ID_Types.One2All) return true;
            
            let client = message.from;
            if(this._client.is_equal(client.addr, client.port))
                return true;
        }
        
        return false;
    }
}

export class TCP_Server
{
    constructor(secure, addr, port, clients = [])
    {
        this._secure = secure;
        this._addr = addr;
        this._port = port;
        this._clients = clients;
        
        this._name = "";
    }
    
    select_clients(select)
    {
        let s = select ? true : false;
        this._clients.forEach(client => client.selected(s));
    }
    
    is_all_clients_selected()
    {
        if(this._clients.length == 0) return false;
        return this._clients.every(client => client.selected() == true);
    }
    
    selected_clients()
    {
        return this._clients.filter(client => client.selected() == true);
    }
    
    name(new_name)
    {
        if(new_name)
            this._name = new_name;
        return this._name;
    }
    
    name_id(secure = true)
    {
        if(name.length > 0) return this.name();
        return this.id_str(secure);
    }
    
    addr(){ return this._addr; }
    port(){ return this._port; }
    
    id()
    {
       return {addr: this.addr(), port: this.port()}; 
    }
    
    id_str(secure = true)
    {
        let id = "";
        if(secure) id = `${this._secure}://`
        
        return `${id}${this._addr}:${this._port}`;
    }
        
    full_id(){
        if(this._name)
        {
            return `${this._name}(${this.id()})`;
        }
        return this.id_str();
    }
    
    is_equal(addr, port)
    {
        if(this._port != port)
            return false;
        
        if(this._addr == addr || this._addr == '0.0.0.0'){
            return true;
        }
        
        return false;
    }
    
    clients(clients = null)
    {
        if(clients != null)
            this._clients = clients;
        return this._clients;
    }
    
    static is_equal(addr1, port1, addr2, port2)
    {
        if(port1 != port2)
            return false;
        
        if(addr1 == addr2 || addr1 == '0.0.0.0' || addr2 == '0.0.0.0'){
            return true;
        }
        
        return false;
    }
}

export class TCP_Server_Client
{
    constructor(addr, port)
    {
        this._addr = addr;
        this._port = port;
        this._name = "";
        this._selected = false;
    }
    
    name(new_name)
    {
        if(new_name)
            this._name = new_name;
        return this._name;
    }
    
    name_id(){
        if(this._name.length > 0) return this.name();
        return this.id_str();
    }
    
    addr(){ return this._addr; }
    port(){ return this._port; }
    
    id()
    {
        return {addr: this.addr(), port: this.port()};    
    }
    
    id_str()
    {        
        return `${this._addr}:${this._port}`;
    }
        
    full_id(){
        if(this._name)
        {
            return `${this._name}(${this.id()})`;
        }
        return this.id_str();
    }
    
    is_equal(addr, port)
    {
        if(this._port != port)
            return false;
        
        if(this._addr == addr)
            return true;
        
        return false;
    }
    
    selected(sel = null)
    {
        if(sel !== null){
            this._selected = sel ? true : false;
        }
        
        return this._selected;
    }
    
    static is_equal(addr1, port1, addr2, port2)
    {
        if(port1 != port2)
            return false;
        
        if(addr1 == addr2){
            return true;
        }
        
        return false;
    }
}