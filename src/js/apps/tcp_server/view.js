import {Event_Emitter} from '../../libs/event_emitter.js';
import {TCP_Server_Port, TCP_Server_Secure, TCP_Server_Addr, TCP_Server_Events} from './types.js';
import {html_to_element} from '../../helper/helper.js';
import {get_selected} from '../../helper/helpers_basic.js';

import style from './tcp_server.css';

const template = document.createElement('template');
template.innerHTML = `
<div id=container>
    <div id=opt-container>
        <input-socket-ipv4 id=socket-opt ip=${TCP_Server_Addr} port=${TCP_Server_Port.value} addr-disabled=true></input-socket-ipv4>
        <span id=button-opt title='Socket options'>&#x2304;</span>
    </div>
    <div id=options-config>
        <table>
            <tr><th colspan=3><span>KeepAlive</span><input id=keepalive-check type=checkbox></th></tr>
            <tr><th>Idle</th><th>Interval</th><th>Count</th></tr>
            <tr>
                <td><input type=number id=keepalive-idle 
                        title=Idle min=1 style=width:7ch>s</td>
                <td><input type=number id=keepalive-intval 
                        title=Interval min=1 style=width:5ch>s</td>
                <td><input type=number id=keepalive-count 
                        title=Count min=1 style=width:4ch></td>
            </tr>
        </table>
    </div>
    <div id=button-container>
        <button id=button-open>Open</button>
        <button id=button-update>Update</button>
    </div>
    <closeable-status id=error behaviour=hidden></closeable-status>
    <div id=list>Sockets</div>
    <ul id=body-list></ul>
</div>`;

export class TCP_Server_View extends Event_Emitter{
    constructor(model)
    {
        super();
        
        this._model = model;
        this._container = null;
        this._error_el = null;
        
        
        this._model.on(TCP_Server_Events.ERROR, arg => this.error(arg))
                    .on(TCP_Server_Events.STATUS, servers => this.add_servers(servers))
                    .on(TCP_Server_Events.SERVER_ERROR, arg => this.server_error(arg))
                    .on(TCP_Server_Events.KEEPALIVE, opt => this.keepalive(opt));     
    }
        
    error(err)
    {
        this._error_el.value = `[${err.error.code}] ${err.error.message}${err.hasOwnProperty('what') ? '=' + err.what : ''}`;
//        error_el.style.display = 'block';
    }
    
    server_error(err){
        this._error_el.value = `[${err.data.code}] ${err.data.message}`;
//        error_el.style.display = 'block';
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
        
        /*
        * Investigate... somehow cloneNode or appendChild are are not working syncronously
        * Added setTimeout as a workaround
        */
        setTimeout(() => {
            let socket = this._container.querySelector('#socket-opt');
            socket.render(TCP_Server_Secure);

            this._container.querySelector('#button-open').onclick = (event) => {
                let opt = {
                    secure: socket.protocol(),
                    addr: socket.ip(),
                    port: socket.port()
                }
                this.emit(TCP_Server_Events.OPEN, opt);
            }

            this._container.querySelector('#button-update').onclick = event => {
                this.emit(TCP_Server_Events.UPDATE);
            }

            let options_config = this._container.querySelector('#options-config');
            options_config.style.display = 'none';
            this._container.querySelector('#button-opt').onclick = event => {
                if(options_config.style.display === 'none')
                    options_config.style.display = 'block';
                else
                    options_config.style.display = 'none';
            }

            this.keepalive(this._model.keepalive());
            
            this._container.querySelector("#options-config").addEventListener('change', ev => {
                this.keepalive();
            });
        }, 0);
    }
           
    keepalive(opt = null)
    {
        let keepalive_check = this._container.querySelector('#keepalive-check'),
            keepalive_idle = this._container.querySelector('#keepalive-idle'),
            keepalive_intval = this._container.querySelector('#keepalive-intval'),
            keepalive_count = this._container.querySelector('#keepalive-count');
        
        if(opt !== null)
        {
            keepalive_check.checked = opt.keepalive;
            keepalive_idle.value = opt.idle;
            keepalive_intval.value = opt.interval;
            keepalive_count.value = opt.count;
        } else
            this.emit(TCP_Server_Events.KEEPALIVE, {
                                                keepalive: keepalive_check.checked,
                                                idle: parseInt(keepalive_idle.value),
                                                interval: parseInt(keepalive_intval.value), 
                                                count: parseInt(keepalive_count.value)
                                            });
        
        if(keepalive_check.checked){
            keepalive_idle.disabled = false;
            keepalive_intval.disabled = false;
            keepalive_count.disabled = false;
        } else {
            keepalive_idle.disabled = true;
            keepalive_intval.disabled = true;
            keepalive_count.disabled = true;
        }
    }

    add_servers(servers)
    {
        this._clear_error();
        
        let el = this._container.querySelector('#body-list');
        el.innerHTML = '';
        
        if(!servers.length)
        {
            el.innerHTML = '<li class=no-server>No TCP servers listening</li>';
            return;
        }

        servers.forEach(server =>{
            let table = `<li class=item-list><table class=table-item>
                            <thead>
                                <tr class=line>
                                    <th class=server-name><input class=check-input type=checkbox><span>${server.full_id()}</span></th>
                                    <th class=close>&times;</th>
                                </tr> 
                            </thead>
                            <tbody class=clients-list></tbody>
                        </table></li>`;
            
            let table_el = html_to_element(table);
            table_el.querySelector('.close').onclick = event => {
                this.emit(TCP_Server_Events.CLOSE, server);
            };

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
                    this.emit(TCP_Server_Events.CLOSE_CLIENT, {
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
}
