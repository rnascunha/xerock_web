import {View_Template} from '../../core/data/view/view_template.js';
import {View_Events} from '../../core/data/view/types.js';

import {Terminal} from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import {Register_ID} from '../../core/id/controller.js';
import {Register_ID_Events} from '../../core/id/types.js';
import {App_ID_Template} from '../../core/id/id_template.js';
import {ID_Types} from '../../core/id/id_template.js';
import {App_Events} from '../../core/types.js';
import {Filter_Model} from '../../core/libs/filter/model.js'
import {make_app_filter} from '../../core/libs/filter/functions.js'
import {Message_Direction, Message_Type, get_message_data} from '../../core/libs/message_factory.js';

import {Byte_Array} from '../../libs/byte_array/byte_array.js';
import {Data_Type} from '../../libs/byte_array/types.js';

import xterm_style from '../../../../node_modules/xterm/css/xterm.css';

const html = `
<style>
    html,body
    {
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        background-color: brown;
    }

    #container
    {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        justify-content: stretch;
    }

    #header
    {
        background-color: red;
        display:flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 2px 4px;
        margin-bottom: 2px;
        align-items: center;
    }

    #theme:after
    {
        content: '\u25D0';
    }
    
    .header-end
    {
        display: inline-block;
        padding: 3px 6px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
    }

    .header-end:hover
    {
        transform: translateY(4px);
    }
    
    #terminal
    {
        flex-grow: 1;
        height: 100%;
        width: 100%;
        align-self: stretch;
        background-color: black;
    }

    #title
    {
        font-family: "Courier", Times, serif;
        font-size: 23px;
        margin-top: 2px;
    }

    #title:after
    {
        content: 'View::Terminal';
    }
    
    #id{ width: 150px; }
    .no-id-avaliable{ display: none; }

    #selected-id
    { 
        font-weight: bold; 
        padding: 2px;
        border-radius: 4px;
        max-width: 33%;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    #selected-id:hover
    {
        background-color: brown;
    }

    #select-container
    {
        padding: 30px;
        border: 2px solid black;
        border-radius: 10px;
    }

    #select-container h3
    {
        margin: 0px 0px 5px 0px;
        text-align: center;
    }

    #select-container select,
    #select-container button
    {
        padding: 10px;
    }

    my-modal
    {
        --my-modal-content-width: fit-content;
        --my-modal-content-height: fit-content;
    }

    #status
    {
        padding: 5px;
        font-weight: bold;
    }

    #buffer-container
    {
        display: flex;
        padding: 5px;
        background-color: yellow;
    }

    #label-buffer
    {
        font-weight: bold;
    }

    #buffer
    {
        background-color: inherit;
        outline: none;
        border: 0px;
        border-bottom: 0px solid black;
        flex-grow: 1;
        font-family: monospace;
    }

    .error
    {
        background-color: red;
        color: white;
    }

    .warning
    {
        background-color: rgb(200, 200, 50);
    }

    .ok
    {
        background-color: green;
    }

    #terminal-options
    {
        background-color: blue;
        padding: 5px;
        color: white;
    }

    .option-item
    {
        cursor: pointer
    }

    ${xterm_style.toString()}
</style>

<div id=container>
    <div id=header>
        <div id=selected-id></div>
        <span id=title></span>
        <div>
            <div id=theme class=header-end title='Dark/Light theme'></div>
            <div id=open-selector class=header-end>Open</div>
        </div>
    </div>
    <div id=terminal></div>
    <div id=buffer-container>
        <label id=label-buffer for=buffer>Input: </label>
        <input id=buffer placeholder='Send Data'>
    </div>
    <div id=status>Status info</div>
    <div id=terminal-options>
        <label class=option-item><input id=show-send-message type=checkbox>Show send message</label>
        <label class=option-item title="Convert '\\n' to '\\r\\n'"><input id=convert-eol type=checkbox>Convert EOL</label>
    </div>
</div>`;

const selector = `
<div id=select-container>
    <h3>Select ID</h3>
    <div>
        <select id=id></select>
        <button id=select-id-button>Select</button>
    </div>
</div>`;

const status = {
    CONNECTED: Symbol('connected'),
    DISCONNECTED: Symbol('disconnected')
}

const message_type = {
    ERROR: {color: '1;31m'},
    WARNING: {color: '103m'},
    OK: {color: '32m'},
    NONE: {color: null},
}

const themes = {
    dark: {
        background: '#000',
        foreground: '#fff',
        selection: '#888',
        cursor: '#fff'
    },
    light: {
        background: '#fff',
        foreground: '#000',
        selection: '#111',
        cursor: '#000'
    }
}

export class Terminal_View extends View_Template
{
    constructor(name, options = {})
    {
        super(name, options);
        
        this._terminal = new Terminal({cursorBlink: true, termName: 'Terminal View'});
        this._fit_addon = new FitAddon();
        this._terminal.loadAddon(this._fit_addon);
        
        this._input_id = null;
        this._id = null;
        
        this._status = status.DISCONNECTED;
        
        this._modal = null;
        this._status_message = null;
        this._show_send = null;
        this._buffer_message = null;
        
        this._buffer = '';        
        
        this._theme = 'dark';
    }
    
    render(container)
    {
        container.innerHTML = html;
//        let script = document.createElement('script');
//        script.src = 'js/components/modal.js';
//        container.appendChild(script);

        let terminal = container.querySelector('#terminal');
        this._terminal.open(terminal);
        /*
        * https://stackoverflow.com/a/21043017
        * Explain why the setTimeout
        */
        setTimeout(() => this._fit_addon.fit(), 0);
        
        this._terminal.setOption('cursorBlink', true);
        this._terminal.focus();
        this._terminal.write('Welcome to \x1B[1;3;31mTerminal View\x1B[0m $\r\n\r\n');
        
        if('input' in this.options && !this.options.input)
            container.querySelector('#buffer-container').style.display = 'none';
        
        this._show_send = container.querySelector('#show-send-message');
        this._status_message = container.querySelector('#status');
        this._buffer_message = container.querySelector('#buffer');
        
        this._modal = document.createElement('my-modal');
        this._modal.innerHTML = selector;
        this._modal.show = true;
        container.appendChild(this._modal);
        
        let select_id = this._modal.querySelector('#id')
        this._input_id = new Register_ID(select_id, {include_only_type: ID_Types.One2One });
        
        container.querySelector('#open-selector').addEventListener('click', ev => {
            this._modal.show = true;
        });
        
        container.querySelector('#buffer').addEventListener('keyup', ev => {
            this.send(ev.target.value, ev.key, ev.target);
        });
        
        this._modal.querySelector('#select-id-button').addEventListener('click', ev => {
            let id = this._input_id.selected();
            if(!id) return;
            this._status = status.CONNECTED;
            
            if(!this._id || !this._id.is_equal(id))
            {
                this._id = id;
                this.status_message(`Connected ${this._id.name()}`, 'OK');
                
                let selected_id_el = container.querySelector('#selected-id');
                selected_id_el.textContent = this._id.full_name();
                selected_id_el.title = this._id.full_name();
                
                this.emit(View_Events.SELECT_ID, {view: this, id: this._id});
            }
            
            this._modal.show = false;    
        });
        
        container.querySelector('#convert-eol')
            .addEventListener('change', ev => 
                this._terminal.setOption('convertEol', ev.target.checked));
        
        this.on(Register_ID_Events.CHECK_IDS, list => this._check_input(list))
            .on(App_Events.RECEIVED_MESSAGE, message => this._on_message(message));
        
        this.emit(Register_ID_Events.PROPAGATE, this._input_id);
        
        this.window().addEventListener('resize', ev => this._fit_addon.fit());
        
        container.querySelector('#theme').addEventListener('click', ev => {
            this._theme = this._theme === 'dark' ? 'light' : 'dark';
            this._terminal.setOption('theme', themes[this._theme]);
            
            terminal.style.backgroundColor = this._theme === 'dark' ? '#000' : '#fff';
        });
    }
    
    _on_message(message)
    {
        if(this._status !== status.CONNECTED) return;
        if(this._id.filter_message(message, true, {"type": [Message_Type.data.value]}))
        {
            let data = get_message_data(message);
            if(!data) return;
            
            if(message.dir == Message_Direction.sent.value)
                this.post_send(data);
            else this._terminal.write(data);
        }
    }
    
    _check_input(list)
    {
        if(this._id)
        {
            let check = this._id.is_at_list(list);
            if(this._status === status.CONNECTED)
            {
                if(check === -1) this.status_message('Server DISCONNECTED', 'ERROR');
                else if(check === -2) this.status_message('App Unregistered', 'ERROR');
                else if(check === -3) this.status_message('ID Removed', 'ERROR');

                if(check < 0)
                    this._status = status.DISCONNECTED;
            } 
            else if(check instanceof App_ID_Template) //Trying to reconnect
            {
                this._id = check;
                this.status_message(`Reconnected ${this._id.name()}`, 'OK');
                this._status = status.CONNECTED;
            }
        }
        this._input_id.check_ids(list);
    }
    
    send(data, key, container)
    {
        if(key === 'Enter' && data.length)
        {
            if(this._status === status.CONNECTED)
            {
                this._id.send(new Uint8Array(Byte_Array.parse(data, Data_Type.text.value)));
                container.value = '';
            } else
                this._set_status_bar('Not connected', 'WARNING');
        }
    }
    
    post_send(data)
    {
        if(!this._show_send.checked) return;
        
        if(data instanceof Uint8Array)
            data = new TextDecoder("utf-8").decode(data);
        
        this._terminal.write('\r\n' + '\x1b[44m' + data + '\x1B[0m' + '\r\n')
    }
    
    status_message(message, type = 'NONE')
    {
        let color;
        switch(type)
        {
            case 'ERROR':
            case 'WARNING':
            case 'OK':
                color = '\x1b[' + message_type[type].color;
                break;
            default:
                color = '';
        }
        
        this._terminal.write('\r\n' + color + message + '\x1B[0m' + '\r\n\r\n');
        this._set_status_bar(message, type);
    }
    
    _set_status_bar(message, type)
    {
        switch(type)
        {
            case 'ERROR':
                this._status_message.classList.remove('ok', 'warning');
                this._status_message.classList.add('error');
                break;
            case 'WARNING':
                this._status_message.classList.remove('ok', 'error');
                this._status_message.classList.add('warning');
                break;
            case 'OK':
                this._status_message.classList.remove('warning', 'error');
                this._status_message.classList.add('ok');
                break;
            default:
                this._status_message.classList.remove('ok', 'error', 'warning');
                break;
        }
        this._status_message.textContent = message;
    }
}
