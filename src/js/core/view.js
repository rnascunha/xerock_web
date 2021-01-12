import {Event_Emitter} from '../libs/event_emitter.js';
import {App_Events, default_connect_addr, default_connect_port, Protocol_Conn} from './types.js';
import {get_selected} from '../helper/helpers_basic.js';
import {Input_URL} from '../components/input_url.js';
import {select_element_contents} from '../helper/helper.js';
import {Websocket_Events} from './websocket.js';
import {Configure_Events} from './configure/types.js';

const option_html = `
            <my-retract-menu>
                <h3 class=title-app slot=title>Connect</h3>
                <div id=server-conn-options></div>
            </my-retract-menu>
            <my-retract-menu>
                <h3 class=title-app slot=title>Servers</h3>
                <div id=server-info class=server-info></div>
                <div id=server-conn-server-container class=server-conn-item></div>
            </my-retract-menu>
            <my-retract-menu>
                <h3 class=title-app slot=title>Local</h3>
                <div id=local-app-container class=server-conn-item></div>
            </my-retract-menu>`;

export class App_Dispatcher_View extends Event_Emitter
{
    constructor(model, container)
    {
        super();
        this._model = model;
        
        this._container = container;
        this._container.innerHTML = option_html;
        
        model.on(Websocket_Events.CONNECT_ARGS_ERROR, args => 
                                        this.connect_args_error(args))
            .on(Websocket_Events.ERROR, error => this.exception_error(error))
            .on(App_Events.CLOSE_SERVER, arg => {
                this.close_error(arg);
                this.check_servers();
            })
            .on(App_Events.SERVER_CONNECTED, main_app => this.connected(main_app))
            .on(App_Events.ADD_LOCAL_APP, arg => this.add_local_app(arg))
            .on(App_Events.ADD_CONNECTION, arg => this.add_connection(arg.addr, arg.options))
        
        this._options = container.querySelector("#server-conn-options");
        this._servers = container.querySelector('#server-conn-server-container');
        this.render();
        
        this.check_servers();
    }
    
    connect_args_error(arg)
    {
        let message = 'ERROR:';
        if(arg.hasOwnProperty('protocol'))
            message += ` protocol[${arg.protocol}]`;
        if(arg.hasOwnProperty('addr'))
            message += ` addr[${arg.addr}]`;
        if(arg.hasOwnProperty('port'))
            message += ` port[${arg.port}]`;
        if(arg.hasOwnProperty('reason'))
            message += arg.reason;
        
        this.error(message);
    }
    
    check_servers()
    {
        let el = this._container.querySelector('#server-info');
        if(Object.values(this._model._server_list).length === 0)
            el.innerHTML = `No servers connected`;
        else
            el.innerHTML = '';
    }
    
    close_error(arg)
    {
        if(arg.code !== 1000) //Normal closure
            this.error(`Close ${arg.addr}: [${arg.code}] ${arg.message}`);
        else this.error();
    }
    
    exception_error(error)
    {
        this.error(`[${error.code}] ${error.name}: ${error.message} <a target=_blank href=https://github.com/rnascunha/xerock_web#troubleshoot>link</a>`);
    }
    
    render()
    {
        let div_name = document.createElement('div');
        div_name.setAttribute('class', 'server-conn-item');
        
        let input = document.createElement('input');
        input.setAttribute('placeholder', 'Set a server name');
        input.setAttribute('list', 'server-conn-list');
        input.setAttribute('class', 'server-conn-item');
        input.addEventListener('input', ev => this._check_datalist_op(ev));

        div_name.appendChild(input);
        
        let datalist = document.createElement('datalist');
        datalist.setAttribute('id', 'server-conn-list');
        
        let conn = new Input_URL(Protocol_Conn);
        conn.setAttribute('id', 'server-conn-args');
        conn.setAttribute('class', 'server-conn-item');
        conn.addr(default_connect_addr);
        conn.port(default_connect_port);
        conn.protocol(Protocol_Conn.plain);
        
        this._error = document.createElement('closeable-status');
        this._error.id = 'server-conn-error';
        this._error.behaviour = 'hidden';
        
        let div_conn = document.createElement('div');
        div_conn.setAttribute('class', 'server-conn-item');
                
        let button = document.createElement('button');
        button.textContent = 'Connect';
        
        let auto = document.createElement('input');
        auto.type = 'checkbox';
        auto.setAttribute('id', 'server-conn-autoconnect');
        
        button.onclick = ev => {
            this.emit(App_Events.CONNECT_REQUEST, {
                addr: conn.addr (),
                port: conn.port(),
                proto: conn.protocol(),
                opt: {
                    name: input.value,
                    autoconnect: auto.checked
                },
            });
        }
        
        let label = document.createElement('label');
        label.setAttribute('for', 'server-conn-autoconnect');
        label.textContent = 'Auto-connect'
        
        div_conn.appendChild(button);
        div_conn.appendChild(auto);
        div_conn.appendChild(label);
                
        this._options.appendChild(div_name);
        this._options.appendChild(datalist);
        this._options.appendChild(conn);
        this._options.appendChild(this._error);
        this._options.appendChild(div_conn);
    }
    
    error(message)
    {
        if(!message)
        {
            this.clear_error();
            return;
        }
        
        this._error.value = message;
    }
    
    clear_error()
    {
        this._error.hide()
    }
    
    connected(server)
    {
        this.clear_error();
        
        let new_server_container = document.createElement('div');
     
        this._servers.appendChild(new_server_container);
        server.render(new_server_container);
                
        this.check_servers();
    }
    
    add_connection(addr, options)
    {
        let op = document.createElement('option');
        op.value = options.name ? options.name : addr;
        
        op.textContent = addr;
        op.dataset.opt = JSON.stringify({
            addr: addr,
            name: options.name,
            autoconnect: options.autoconnect
        });
        
        let datalist = this._options.querySelector('#server-conn-list');
        
        let flag = true;
        datalist.querySelectorAll('option').forEach(nop => {
           if(nop.textContent == op.textContent) {
               nop.value = op.value;
               flag = false;
           }
        });
        if(flag) datalist.appendChild(op);
    }
    
    _check_datalist_op(ev)
    {
        let datalist = this._options.querySelector('#server-conn-list');
        datalist.querySelectorAll('option').forEach(op => {
           if(op.value == ev.target.value){
               let n_value = JSON.parse(op.dataset.opt),
                   addr = n_value.addr.split(/:\/\/|:/);
               this._options.querySelector('#server-conn-autoconnect').checked = n_value.autoconnect;
               let conn = this._options.querySelector('#server-conn-args');
               conn.addr(addr[1]);
               conn.port(addr[2]);
               Object.values(Protocol_Conn).some(proto => {
                   if(proto.value == addr[0]){
                       conn.protocol(proto.value);
                       return true;
                   }
                    return false;
               });
           }
        });
    }
    
    add_local_app(arg)
    {
        let container = this._container.querySelector('#local-app-container'),
            new_app = document.createElement('my-retract-menu');
        
        new_app.classList.add('local-app-container');
        new_app.show = false;
            
        
        new_app.innerHTML = `<h4 slot=title>${arg.app.long_name()}</h4>
                            <div class=local-app></div>`;
        
        let app_container = new_app.querySelector('.local-app');
        
        arg.app.render(app_container.attachShadow({mode: 'open'}));
        
        container.appendChild(new_app);
    }
}