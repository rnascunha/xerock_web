import {Event_Emitter} from '../../libs/event_emitter.js';
import {TCP_Client_Port, TCP_Client_Secure, TCP_Client_Addr, TCP_Client_Events} from './types.js';
import {html_to_element} from '../../helper/helper.js';
import {event_path} from '../../helper/compatibility.js';
//import {Optional_Container} from "../../components/optional-container.js";

import style from './tcp_client.css';

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

const keepalive_template = document.createElement('template');
keepalive_template.innerHTML = `
<table id=keepalive>
    <tr>
        <th colspan=3><span>KeepAlive</span><input id=keepalive-check type=checkbox></th>
    </tr>
    <tr>
        <th>Idle</th>
        <th>Interval</th>
        <th>Count</th>
    </tr>
    <tr>
        <td><input type=number id=keepalive-idle title=Idle min=1 style=width:7ch>s</td>
        <td><input type=number id=keepalive-intval title=Interval min=1 style=width:5ch>s</td>
        <td><input type=number id=keepalive-count title=Count min=1 style=width:4ch></td>
    </tr>
</table>`;

export class TCP_Client_View extends Event_Emitter{
    constructor(model)
    {
        super();
        
        this._model = model;
        this._container = null;
        this._error_el = null;
                
        this._model.on(TCP_Client_Events.ERROR, arg => this.error(arg))
                    .on(TCP_Client_Events.STATUS, clients => this.add_clients(clients))
                    .on(TCP_Client_Events.SERVER_ERROR, arg => this.server_error(arg))
                    .on(TCP_Client_Events.KEEPALIVE, opt => this.keepalive(opt));     
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
        
        let socket = document.createElement('input-socket-ipv4'),
            keepalive = document.importNode(keepalive_template.content, true),
            div_keep = document.createElement('div');
        
        //This need to be done to keep alive not be document-fragment. 
        //Is there a more pretty way? I'm a pretty boy...
        div_keep.appendChild(keepalive);
        keepalive = div_keep.querySelector('#keepalive');
        
        socket.id = 'socket-opt';
        socket.ip(TCP_Client_Addr);
        socket.port(TCP_Client_Port.value);
        
        options.add(socket);
        options.add(keepalive, true);
        
        this._error_el = this._container.querySelector('#error');
        
        socket.render(TCP_Client_Secure);

        this._container.querySelector('#button-open').onclick = (event) => {
            let opt = {
                secure: socket.protocol(),
                addr: socket.ip(),
                port: socket.port()
            }
            this.emit(TCP_Client_Events.OPEN, opt);
        }

        this._container.querySelector('#button-update').onclick = event => {
            this.emit(TCP_Client_Events.UPDATE);
        }
        
        keepalive.addEventListener('change', ev => {
            this.keepalive();
        });

        this.keepalive(this._model.keepalive());
        
        //Check close button
        this._container.querySelector('#body-list').addEventListener('click', ev => {
            let path = event_path(ev);
            
            if('close' in path[0].dataset)
            {
                let addr =  path[0].dataset.close.split(/:\/\/|:/);
                this.emit(TCP_Client_Events.CLOSE, {
                    secure: addr[0], 
                    local: {
                        addr: addr[1],
                        port: +addr[2]
                    }
                })
            }
                
        });
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
            this.emit(TCP_Client_Events.KEEPALIVE, {
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
            socket.textContent = `${client.secure}://${client.local.addr}:${client.local.port}>${client.remote.addr}:${client.remote.port}`;
            close_btn.classList.add('close');
            close_btn.dataset.close = `${client.secure}://${client.local.addr}:${client.local.port}`;
                        
            line.appendChild(socket);
            line.appendChild(close_btn);
            
            body.appendChild(line);
        });
    }
}