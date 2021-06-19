import {App_Daemon_Template} from '../../core/app/app_template.js';
import {App_List} from '../app_list.js';
import {Control_Type} from '../../core/libs/message_factory.js';
import {Message_Info} from '../../core/types.js';
import {UDP_Server_ID, UDP_Server, UDP_Server_Client} from './udp_server.js';
import {validate_ipv4_addr} from '../../helper/helper_types.js';
import {UDP_Server_Port, 
        UDP_Server_Secure, 
        UDP_Server_Events, 
        UDP_Server_Error} from './types.js';
import {ID_Types} from '../../core/id/id_template.js';

export class UDP_Server_Model extends App_Daemon_Template
{
    constructor(server)
    {
        super(App_List.UDP_SERVER.name, server, App_List.UDP_SERVER.long_name);
        this._list_servers = [];
    }
    
    enable(en)
    {
        if(en) this._send_status();
    }
    
    servers()
    {
        return this._list_servers;
    }
    
    clients(id)
    {
        let server = this._list_servers.find(ser => ser.is_equal(id.addr, id.port));
        
        if(server) return server.clients();
        else return false;
    }
    
    _send_status()
    {
        this.send_control(Control_Type.status.value);
    }
    
    send_status()
    {
        this._send_status();
    }
    
    make_error(error, what = null)
    {
        if(what)
            return {error: error, what: what};
        
        return {error: error};
    }
    
    open(conn_arg)
    {
        if(!validate_ipv4_addr(conn_arg.addr))
        {
            this.emit(UDP_Server_Events.ERROR, this.make_error(UDP_Server_Error.INVALID_ADDR, conn_arg.addr));
            return;
        }
        
        conn_arg.port = +conn_arg.port;
        if(conn_arg.port < UDP_Server_Port.min || conn_arg.port > UDP_Server_Port.max)
        {
            this.emit(UDP_Server_Events.ERROR, this.make_error(UDP_Server_Error.INVALID_PORT, conn_arg.port));
            return;
        }
                
        this.send_control(Control_Type.open.value, conn_arg);
    }
    
    close(server)
    {
        this.send_control(Control_Type.close.value, {addr: server.addr(), port: server.port()});
    }
    
    close_client(arg)
    {
        let server_ep = arg.server,
            client_ep = arg.client;
        
        let server = this._list_servers.find(s => s.is_equal(server_ep.addr, server_ep.port))
        if(!server) return;
        
        server.remove_client(client_ep.addr, client_ep.port);
        
        this.emit(UDP_Server_Events.CLOSE_CLIENT, {server: server, client: client_ep})
    }
        
    send_data(data, id, to, opt)
    {
        let clients_addr = this._make_clients_list(id.to_clients(to));
        if(!clients_addr) return null;
        
        return {from: id.id(), to: clients_addr, data: data};
    }
            
    _make_clients_list(clients)
    {        
        if(!clients.length)
        {
            this.emit(UDP_Server_Events.ERROR, this.make_error(UDP_Server_Error.CLIENT_NOT_SELECTED));
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
    
    add_client(server, client)
    {
        console.log('add_client', server, client);
        if(!('addr' in client && validate_ipv4_addr(client.addr)))
        {
            this.emit(UDP_Server_Events.ERROR, this.make_error(UDP_Server_Error.INVALID_ADDR, client.addr));
            return;
        }
        if(!('port' in client 
             && Number.isInteger(client.port) 
             && (client.port > 1024 && client.port < 65535)))
        {
            this.emit(UDP_Server_Events.ERROR, this.make_error(UDP_Server_Error.INVALID_PORT, client.port));
            return;
        }
                
        if(server.add_client(client.addr, client.port))
        {
            this._set_input_servers();
            this.emit(UDP_Server_Events.ADD_CLIENT, {server: server, client: client});
        }
    }
        
    _search_id(addr, port)
    {
        return this._list_servers.find(s => s.is_equal(addr, port))
    }
    
    _data_message(message)
    {
        let to = message.data.to;
        let server = this._list_servers.find(s => s.is_equal(to.addr, to.port));
        if(!server) return;
        
        let from = message.data.from;
        if(server.add_client(from.addr, from.port))
        {
            this._set_input_servers();
            this.emit(UDP_Server_Events.ADD_CLIENT, {server: server, client: from});
        }
    }
    
    _control_status(message)
    {
        let old_list_servers = this._list_servers;
        this._list_servers = [];
        message.data.list.forEach(server => {
            let old_server = old_list_servers.find(s => s.is_equal(server.addr, server.port));
            if(old_server)
                this._list_servers.push(old_server);
            else
                this._list_servers.push(new UDP_Server(server.addr, server.port));
        });
        this._set_input_servers();
        this.emit(UDP_Server_Events.STATUS, this._list_servers);
    }
        
    _control_error(message)
    {
        this.emit(UDP_Server_Events.SERVER_ERROR, message);
    }
    
    _format_control_status(new_message, message)
    {
        if('data' in message && 'list' in message.data)
        {
            let list_server = "";
            message.data.list.forEach((server, idx) => {
                if(idx != 0) list_server += '\n';
                list_server += `${server.addr}:${server.port}`;
            });
            new_message.data.push(list_server);
        }
    }
        
    _format_control_open(new_message, message)
    {
        let server = message.data;
        new_message.data.push(`${server.addr}:${server.port}`);
    }
    
    _format_control_close(new_message, message)
    {
         new_message.data.push(`${message.data.addr}:${message.data.port}`);
    }
         
    _set_input_servers()
    {
        let new_ids = [];
        this._list_servers.forEach(server => { 
            new_ids.push(new UDP_Server_ID(server, this, ID_Types.One2N));
            new_ids.push(new UDP_Server_ID(server, this, ID_Types.One2All));
            server.clients().forEach(client => {
               new_ids.push(new UDP_Server_ID(server, this, ID_Types.One2One, client)); 
            });
        });
        this.update_ids(new_ids);
    }
}