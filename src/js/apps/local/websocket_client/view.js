import {Event_Emitter} from '../../../libs/event_emitter.js';
import {Events, default_port, default_addr, ws_protocol} from './types.js';
import {WebSocket_Client_ID} from './id.js';
//import {Input_Socket_IPv4} from '../../../components/input_socket_ipv4.js'
import {Input_URL} from '../../../components/input_url.js'

import style from './websocket_client.css';

const template = document.createElement('template');
template.innerHTML = `
<div id=container></div>
<closeable-status behaviour=hidden id=error></closeable-status>
<table>
    <tr id=header-line><th id=socket-name>Socket</th><th id=socket-close>#</th></tr>
    <tbody id=socket-container></tbody>
</table>
`

export class WebSocket_Client_View extends Event_Emitter
{
    constructor(model)
    {
        super();
        
        this._model = model;
        this._container = null;
        
        this._model.on(Events.ERROR, error => this.error(error))
                    .on(Events.ADD, id => this.add_sockets())
                    .on(Events.CLOSE, id => this.add_sockets())
                    .on(Events.OPEN, dev => this.render_devices());
    }

    render(container)
    {
        this._container = container; 
        
        const style_el = document.createElement('style');
        style_el.innerHTML = style.toString();
                
        this._container.appendChild(style_el);
        this._container.appendChild(template.content.cloneNode(true));
        
        let socket_opt = new Input_URL(ws_protocol);
        socket_opt.addr(default_addr);
        socket_opt.port(default_port);
        socket_opt.innerHTML = '<span id=connect-button></span>';
        this._container.querySelector('#container').appendChild(socket_opt);
        
        this._container.querySelector('#connect-button').onclick = ev => {
            this.emit(Events.OPEN, {
                secure: socket_opt.protocol(),
                addr: socket_opt.addr(), 
                port: socket_opt.port()
            });
        }
        
        this.add_sockets();
    }
    
    add_sockets()
    {
        let sockets = this._container.querySelector('#socket-container');
        if(this._model.sockets().length == 0)
            sockets.innerHTML = '<tr><td colspan=2 class=socket-name>No sockets connected</td></tr>';
        else{
            sockets.innerHTML = '';
            this._model.sockets().forEach(sock => {
                let line = document.createElement('tr');
                line.innerHTML = `<td class=socket-name>${sock.addr()}</td><td class=socket-op></td>`;
                line.querySelector('.socket-op').onclick = ev => {
                    this.emit(Events.CLOSE, sock);
                }
                
                line.querySelector('.socket-name').onclick = ev => { console.log(sock); }
                
                sockets.appendChild(line);
            });
        }
    }
    
    error(msg)
    {
        this._container.querySelector('#error').value = msg;
    }
}