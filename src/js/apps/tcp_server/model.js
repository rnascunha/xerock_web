import {App_Daemon_Template} from '../../core/app/app_template.js';
import {App_List} from '../app_list.js';
import {Control_Type} from '../../core/libs/message_factory.js';
import {Message_Info} from '../../core/types.js';
import {copy} from '../../helper/object_op.js';
import {TCP_Server_ID, TCP_Server, TCP_Server_Client} from './tcp_server.js';
import {validate_ipv4_addr} from '../../helper/helper_types.js';
import {TCP_Server_Port, 
        TCP_Server_Secure, 
        TCP_Server_Events, 
        TCP_Server_Keepalive,
        TCP_Server_Error} from './types.js';
import {ID_Types} from '../../core/id/id_template.js';

export class TCP_Server_Model extends App_Daemon_Template
{
    constructor(server)
    {
        super(App_List.TCP_SERVER.name, server, App_List.TCP_SERVER.long_name);
        this._list_servers = [];
        
        this._keepalive = TCP_Server_Keepalive;
    }
    
    enable(en)
    {
        if(en) this._send_status();
    }
    
    servers()
    {
        return copy(this._list_servers);
    }
    
    clients(id)
    {
        let server = this._list_servers.find(ser => ser.is_equal(id.addr, id.port));
        
        if(server) return copy(server.clients());
        else return false;
    }
    
    keepalive(keepalive_opt = null)
    {
        if(keepalive_opt !== null)
        {
            this._keepalive = keepalive_opt;
            this.emit(TCP_Server_Events.KEEPALIVE, this._keepalive);
        }
        
        return this._keepalive;
    }
    
    _send_status()
    {
        this.send_control(Control_Type.status.value);
    }
    
    send_status(){
        this._send_status();
    }
    
    make_error(error, what = null){
        if(what)
            return {error: error, what: what};
        
        return {error: error};
    }
    
    open(conn_arg)
    {
        if(!validate_ipv4_addr(conn_arg.addr))
        {
            this.emit(TCP_Server_Events.ERROR, this.make_error(TCP_Server_Error.INVALID_ADDR, conn_arg.addr));
            return;
        }
        
        conn_arg.port = +conn_arg.port;
        if(conn_arg.port < TCP_Server_Port.min || conn_arg.port > TCP_Server_Port.max)
        {
            this.emit(TCP_Server_Events.ERROR, this.make_error(TCP_Server_Error.INVALID_PORT, conn_arg.port));
            return;
        }
        
        if(!(conn_arg.secure == TCP_Server_Secure.plain.value 
             || conn_arg.secure == TCP_Server_Secure.ssl.value))
        {
            this.emit(TCP_Server_Events.ERROR, this.make_error(TCP_Server_Error.INVALID_SECURE, conn_arg.secure.value));
            return;
        }
        
        conn_arg.options = this.keepalive();
        
        this.send_control(Control_Type.open.value, conn_arg);
    }
    
    close(server)
    {
        this.send_control(Control_Type.close.value, {addr: server.addr(), port: server.port()});
    }
    
    close_client(client)
    {
        this.send_control(Control_Type.custom.value, client);
    }
        
    send_data(data, id, to, opt)
    {
        let clients_addr = this._make_clients_list(id.to_clients(to));
        if(!clients_addr) return null;
        
        return {from: id.id(), to: clients_addr, data: data};
    }
            
    _make_clients_list(clients)
    {        
        if(!clients.length){
            this.emit(TCP_Server_Events.ERROR, this.make_error(TCP_Server_Error.CLIENT_NOT_SELECTED));
            return false;
        }
        
        let clients_addr = [];
        clients.forEach(client => clients_addr.push({ addr: client.addr(), port: client.port() }));
        
        return clients_addr;
    }
    
    message_info(type_info, message, opt)
    {
        switch(type_info)
        {
            case Message_Info.ID:
            case Message_Info.ID_STRING:
                let server_addr = message.data['echoed' in message ? 'from' : 'to'],
                    server = this._search_id(server_addr.addr, server_addr.port);
                    if(server)
                    {
                        if(type_info == Message_Info.ID_STRING) return server.id_str(false);
                        else return server.id();
                    } else return null;                
                break;
            case Message_Info.FROM:
                return message.data['echoed' in message ? 'to' : 'from'];
            case Message_Info.FROM_STRING:
                let client = message.data['echoed' in message ? 'to' : 'from'],
                    client_str = '';
                if(!Array.isArray(client)) client = [client];
                client.forEach((c, idx) => {
                    if(idx != 0) client_str += '\n';
                    client_str += `${c.addr}:${c.port}`;
                });
                return client_str;
            case Message_Info.DATA_OUTPUT:
                return [message.data.data];
            case Message_Info.DATA_FIELD:
                return 0;
        }
        return null;
    }
        
    _search_id(addr, port)
    {
        return this._list_servers.find(s => s.is_equal(addr, port))
    }
    
    _control_status(message)
    {
        let old_list_servers = this._list_servers;
        this._list_servers = [];
        message.data.list.forEach(server => {
            let old_server = old_list_servers.find(s => s.is_equal(server.addr, server.port));
            let old_clients = []
            if(old_server) old_clients = old_server.clients();
            
            let clients = [];
            server.clients.forEach(client => {
               clients.push(new TCP_Server_Client(client.addr, client.port));
            });
            if(old_server)
            {
                old_server.clients(clients);
                this._list_servers.push(old_server);
            } 
            else
                this._list_servers.push(new TCP_Server(server.secure, server.addr, server.port, clients));
            
            //Set selected
            clients.forEach(client => {
               old_clients.forEach(old_client => {
                   if(old_client.is_equal(client.addr(), client.port())) client.selected(old_client.selected());
               }) 
            });
        });
        this._set_input_servers();
        this.emit(TCP_Server_Events.STATUS, this._list_servers);
    }
        
    _control_error(message)
    {
        this.emit(TCP_Server_Events.SERVER_ERROR, message);
    }
    
    _format_control_status(new_message, message)
    {
        if(message.hasOwnProperty('data') && message.data.hasOwnProperty('list'))
        {
            let list_server = "";
            message.data.list.forEach((server, idx) => {
                if(idx != 0) list_server += '\n';
                list_server += `${server.secure}://${server.addr}:${server.port}[${server.clients.length}]`;
            });
            new_message.data.push(list_server);
        }
    }
        
    _format_control_open(new_message, message)
    {
        let server = message.data;
        new_message.data.push(`${server.secure}://${server.addr}:${server.port}`);
    }
    
    _format_control_close(new_message, message)
    {
         new_message.data.push(`${message.data.addr}:${message.data.port}`);
    }
    
    _format_control_custom(new_message, message)
    {
        new_message.data.push('close client');
        let server = message.data.server, 
            client = message.data.client;
        new_message.data.push(`${server.addr}:${server.port}`);
        new_message.data.push(`${client.addr}:${client.port}`);
    }
     
    _set_input_servers()
    {
        let new_ids = [];
        this._list_servers.forEach(server => { 
            new_ids.push(new TCP_Server_ID(server, this, ID_Types.One2N));
            new_ids.push(new TCP_Server_ID(server, this, ID_Types.One2All));
            server.clients().forEach(client => {
               new_ids.push(new TCP_Server_ID(server, this, ID_Types.One2One, client)); 
            });
        });
        this.update_ids(new_ids);
    }
}