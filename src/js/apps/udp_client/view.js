import {Event_Emitter} from '../../libs/event_emitter.js';
import {UDP_Client_Port, UDP_Client_Secure, UDP_Client_Addr, UDP_Client_Events} from './types.js';
import {html_to_element} from '../../helper/helper.js';
import {event_path} from '../../helper/compatibility.js';

import style from './udp_client.css';

const template = document.createElement('template');
template.innerHTML = `
<div id=container>
    <div id=button-container>
        <button id=button-open>Open</button>
        <button id=button-update>Update</button>
    </div>
    <closeable-status id=error behaviour=hidden></closeable-status>
    <table id=table-list>
        <thead><tr id=header-list><th>Socket</th><th>#</th></tr></thead>
        <tbody id=body-list></tbody>
    </table>
</div>`;

export class UDP_Client_View extends Event_Emitter{
    constructor(model)
    {
        super();
        
        this._model = model;
        this._container = null;
        this._error_el = null;
                
        this._model.on(UDP_Client_Events.ERROR, arg => this.error(arg))
                    .on(UDP_Client_Events.STATUS, clients => this.add_clients(clients))
                    .on(UDP_Client_Events.SERVER_ERROR, arg => this.server_error(arg));
    }
        
    error(err)
    {
        if(!err)
        {
            this._error_el.value = '';
            return;    
        }
        this._error_el.value = `[${err.error.code}] ${err.error.message}${err.hasOwnProperty('what') ? '=' + err.what : ''}`;
    }
    
    server_error(err){
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
        
        let options = document.createElement('optional-container');
        options.id = 'opt-container';
        this._container.appendChild(options);
        
        this._container.appendChild(template.content.cloneNode(true));
        
        let socket = document.createElement('input-socket-ipv4');
        
        socket.id = 'socket-opt';
        socket.ip(UDP_Client_Addr);
        socket.port(UDP_Client_Port.value);
        
        options.add(socket);
        
        this._error_el = this._container.querySelector('#error');
        
        socket.render(UDP_Client_Secure);

        this._container.querySelector('#button-open').onclick = (event) => {
            let opt = {
                addr: socket.ip(),
                port: socket.port()
            }
            this.emit(UDP_Client_Events.OPEN, opt);
        }

        this._container.querySelector('#button-update').onclick = event => {
            this.emit(UDP_Client_Events.UPDATE);
        }
                
        //Check close button
        this._container.querySelector('#body-list').addEventListener('click', ev => {
            let path = event_path(ev);
            
            if('close' in path[0].dataset)
            {
                let addr =  path[0].dataset.close.split(/:\/\/|:/);
                this.emit(UDP_Client_Events.CLOSE, {
                    local: {
                        addr: addr[0],
                        port: +addr[1]
                    }
                })
            }
        });
    }
    
    add_clients(clients)
    {
        let body = this._container.querySelector('#body-list'),
            list = Object.values(clients);
        
        this.error('');
        
        if(list.length == 0)
        {
            body.innerHTML = `<tr class=no-client><td colspan=2>No socket connected</td></tr>`;
            return;
        }
        
        body.innerHTML = '';
        list.forEach(client => {
            let line = document.createElement('tr'),
                socket = document.createElement('td'),
                close_btn = document.createElement('td');
            
            socket.classList.add('line');
            socket.textContent = `${client.local.addr}:${client.local.port}>${client.remote.addr}:${client.remote.port}`;
            close_btn.classList.add('close');
            close_btn.dataset.close = `${client.local.addr}:${client.local.port}`;
                        
            line.appendChild(socket);
            line.appendChild(close_btn);
            
            body.appendChild(line);
        });
    }
}