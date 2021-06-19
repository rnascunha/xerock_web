import {Event_Emitter} from '../../libs/event_emitter.js';
import {UDP_Server_Port, 
        UDP_Server_Secure, 
        UDP_Server_Addr, 
        UDP_Server_Events,
       UDP_Server_Error} from './types.js';
import {html_to_element} from '../../helper/helper.js';
import {get_selected} from '../../helper/helpers_basic.js';

import style from './udp_server.css';

const template = document.createElement('template');
template.innerHTML = `
<div id=container>
    <div id=opt-container></div>
    <div id=button-container>
        <button id=button-open>Open</button>
        <button id=button-update>Update</button>
    </div>
    <closeable-status id=error behaviour=hidden></closeable-status>
    <div id=list>Sockets</div>
    <ul id=body-list></ul>
</div>`;

export class UDP_Server_View extends Event_Emitter{
    constructor(model)
    {
        super();
        
        this._model = model;
        this._container = null;
        this._error_el = null;
        
        this._model.on(UDP_Server_Events.ERROR, arg => this.error(arg))
                    .on(UDP_Server_Events.STATUS, servers => this.add_servers(servers))
                    .on(UDP_Server_Events.SERVER_ERROR, arg => this.server_error(arg))
                    .on(UDP_Server_Events.ADD_CLIENT, arg => this.add_servers())
                    .on(UDP_Server_Events.CLOSE_CLIENT, arg => this.add_servers());
    }
        
    error(err)
    {
        this._error_el.value = `[${err.error.code}] ${err.error.message}${'what' in err ? '=' + err.what : ''}`;
    }
    
    server_error(err)
    {
        this._error_el.value = `[${err.data.code}] ${err.data.message}`;
    }
    
    _clear_error()
    {
        this._error_el.style.display = 'none';
    }
    
    render(container)
    {
        this._container = container;
        
        const style_el = document.createElement('style');
        style_el.innerHTML = style.toString();
        
        this._container.appendChild(style_el);
        this._container.appendChild(template.content.cloneNode(true));

        this._error_el = this._container.querySelector('#error');
        
        let socket = document.createElement('input-socket-ipv4');
        
        socket.id = 'socket-opt';
        socket.ip(UDP_Server_Addr);
        socket.port(UDP_Server_Port.value);        
        socket.render(UDP_Server_Secure);
        this._container.querySelector('#opt-container').appendChild(socket);
                
        /*
        * Investigate... somehow cloneNode or appendChild are are not working syncronously
        * Added setTimeout as a workaround
        */
        setTimeout(() => {
            this._container.querySelector('#button-open').onclick = (event) => {
                let opt = {
                    addr: socket.ip(),
                    port: socket.port()
                }
                this.emit(UDP_Server_Events.OPEN, opt);
            }

            this._container.querySelector('#button-update').onclick = event => {
                this.emit(UDP_Server_Events.UPDATE);
            }

        }, 0);
    }
           
    add_servers()
    {
        this._clear_error();
        
        let servers = this._model.servers();
        let el = this._container.querySelector('#body-list');
        el.innerHTML = '';
        
        if(!servers.length)
        {
            el.innerHTML = '<li class=no-server>No UDP servers listening</li>';
            return;
        }

        servers.forEach(server =>{
            let table = `<li class=item-list><table class=table-item>
                            <thead>
                                <tr class=line>
                                    <th class=server-name><input class=check-input type=checkbox><span>${server.full_id()}</span></th>
                                    <th class=add-client title="Add client">+</th>
                                    <th class=close title="Close sever">&times;</th>
                                </tr> 
                            </thead>
                            <tbody class=clients-list></tbody>
                        </table></li>`;
            
            let table_el = html_to_element(table);
            table_el.querySelector('.close').onclick = event => {
                this.emit(UDP_Server_Events.CLOSE, server);
            };
            
            table_el.querySelector('.add-client').addEventListener('click', ev => {
                this.add_client_box(table_el, server);
            });

            let server_check = table_el.querySelector('.check-input'); 
            server_check.checked = server.is_all_clients_selected();
            server_check.onclick = event => {
                server.select_clients(event.target.checked);
                return this.add_servers(servers);
            }
            
            el.appendChild(table_el);
            
            let clients_el = table_el.querySelector('.clients-list');
            clients_el.innerHTML = '';
            server._clients.forEach(client => {
                let client_line = document.createElement('tr');
                client_line.setAttribute('class', 'client-line');
                let client_name = document.createElement('td');
                client_name.setAttribute('class', 'client-name');
                client_name.colSpan = 2;
                let client_check = document.createElement('input');
                client_check.setAttribute('type', 'checkbox');
                if(client.selected())
                    client_check.checked = true;
                client_check.onclick = event => {
                    client.selected(event.target.checked);
                    return this.add_servers(servers);
                }
                
                let client_span = document.createElement('span');
                client_span.textContent = `${client.full_id()}`;
                client_name.appendChild(client_check);
                client_name.appendChild(client_span);
                
                let client_close = document.createElement('td');
                client_close.setAttribute('class', 'client-close');
                client_close.innerHTML = `&times;`;
                client_line.appendChild(client_name);
                client_line.appendChild(client_close);
                
                clients_el.appendChild(client_line);
                
                client_close.onclick = event => {
                    this.emit(UDP_Server_Events.CLOSE_CLIENT, {
                                                server: {
                                                    addr: server.addr(), 
                                                    port: server.port()
                                                }, 
                                                client: {
                                                        addr: client.addr(), 
                                                        port: client.port()
                                                }});
                                            }
            });
        });
    }
    
    add_client_box(container, server)
    {
        if(container.querySelector('#add-client-pop')) return;
        
        const box = document.createElement('div');
        box.id = 'add-client-pop';
                
        box.innerHTML = `<input-ipv4 id=client-addr placeholder='Client IP'></input-ipv4><div>:</div><input type=number min=1024 max=65535 value=8080 id=client-port><div id=client-submit>&#9654;</div>`;
        const input_addr = box.querySelector("#client-addr"),
              input_port = box.querySelector("#client-port");
        
        box.querySelector("#client-submit").addEventListener('click', ev => {
            this.emit(UDP_Server_Events.ADD_CLIENT, {server: server, client: {addr: input_addr.value, port: +input_port.value}});
            box.outerHTML = '';
        });
        
        window.addEventListener('click', function(e){   
            if (!box.contains(e.target))
            {
                box.outerHTML = '';
            }
        });
        
        container.appendChild(box);
        input_addr.focus();
    }
}
