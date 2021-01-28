import {View_Template} from '../../../core/data/view/view_template.js';
import {View_Events} from '../../../core/data/view/types.js';
import {Data_Compare} from './classes.js';
import {html_template, selector} from './html.js';

import {Register_ID} from '../../../core/id/controller.js';
import {Register_ID_Events} from '../../../core/id/types.js';
import {ID_Types} from '../../../core/id/id_template.js';
import {App_Events} from '../../../core/types.js';
import {Message_Direction, Message_Type, get_message_data} from '../../../core/libs/message_factory.js';
import {App_ID_Template} from '../../../core/id/id_template.js';

import {Data_Type} from '../../../libs/byte_array/types.js';

const default_options = {views: [{type: Data_Type.text.value}, {type: Data_Type.hex.value }]}

const status = {
    CONNECTED: Symbol('connected'),
    DISCONNECTED: Symbol('disconnected')
}

const message_type = {
    ERROR: Symbol('error'),
    WARNING: Symbol('warning'),
    OK: Symbol('ok'),
    NONE: Symbol('null')
}

export class Data_Compare_View extends View_Template
{
    constructor(name, options = {})
    {
        super(name, options);
        
        this._id = null;
        this._status = status.DISCONNECTED;
        
        //Elements
        this._data = null;
        this._status_message = null;
        this._modal = null;
        this._data_content = null;
        this._clear = null;
        this._scroll = null;
    }
    
    render(container)
    {
        container.appendChild(html_template.content.cloneNode(true));
        
        this._data = new Data_Compare(container.querySelector('#data'), default_options);
        
        this._status_message = container.querySelector('#status');
        this._data_content = container.querySelector('#data');
        
        //Add button
        container.querySelector('#add').addEventListener('click', ev => {
            this._data.add_view();
        });
        
        //Break line
        container.querySelectorAll('[name=break-line]').forEach(el => {
            el.addEventListener('click', ev => {
                let num = container.querySelector('#fixed-char-number');
                num.disabled = ev.target.id != 'break-fixed-char';
                this._data.break_line(ev.target.id, num.value);
            });
        });
        
        //Creating modal selector
        this._modal = document.createElement('my-modal');
        this._modal.innerHTML = selector;
        this._modal.show = true;
        container.appendChild(this._modal);
        
        let select_id = this._modal.querySelector('#id')
        this._input_id = new Register_ID(select_id, {include_only_type: ID_Types.One2One });
        
        container.querySelector('#open-selector').addEventListener('click', ev => {
            this._modal.show = true;
        });
        
        container.querySelector('#clear').addEventListener('click', ev => {
            this._data.clear();
        });
        
        this._scroll = container.querySelector('#scroll');
        
        this._modal.querySelector('#select-id-button').addEventListener('click', ev => {
            let id = this._input_id.selected();
            if(!id) return;
            this._status = status.CONNECTED;
            
            if(!this._id || !this._id.is_equal(id))
            {
                this._id = id;
                this.status(`Connected ${this._id.name()}`, 'OK');
                
                let selected_id_el = container.querySelector('#selected-id');
                selected_id_el.textContent = this._id.full_name();
                selected_id_el.title = this._id.full_name();
                
                this.emit(View_Events.SELECT_ID, {view: this, id: this._id});
            }
            
            this._modal.show = false;    
        });
        
        this.on(Register_ID_Events.CHECK_IDS, list => this._check_input(list))
            .on(App_Events.RECEIVED_MESSAGE, message => this._on_message(message));
        
        this.emit(Register_ID_Events.PROPAGATE, this._input_id);        
        
        this.status('Select ID');
    }
    
    _check_input(list)
    {
        if(this._id)
        {
            let check = this._id.is_at_list(list);
            if(this._status === status.CONNECTED)
            {
                if(check === -1) this.status('Server DISCONNECTED', 'ERROR');
                else if(check === -2) this.status('App Unregistered', 'ERROR');
                else if(check === -3) this.status('ID Removed', 'ERROR');

                if(check < 0)
                    this._status = status.DISCONNECTED;
            } 
            else if(check instanceof App_ID_Template) //Trying to reconnect
            {
                this._id = check;
                this.status(`Reconnected ${this._id.name()}`, 'OK');
                this._status = status.CONNECTED;
            }
        }
        this._input_id.check_ids(list);
    }
    
    _on_message(message)
    {
        if(this._status !== status.CONNECTED) return;
        if(this._id.filter_message(message, true, {"type": [Message_Type.data.value]}))
        {
            let data = get_message_data(message);
            if(!data) return;
            
            this._data.add_message(data, message.dir == Message_Direction.received.value);
            this.auto_scroll();
        }
    }
    
    status(message, type = 'NONE')
    {
        let span = document.createElement('span');
        span.textContent = message;
        span.classList.add('message-status');
        
        switch(type)
        {
            case 'ERROR':
                span.classList.add('error');
                this._status_message.classList.remove('ok', 'warning', 'none');
                this._status_message.classList.add('error');
                break;
            case 'WARNING':
                span.classList.add('warning');
                this._status_message.classList.remove('ok', 'error', 'none');
                this._status_message.classList.add('warning');
                break;
            case 'OK':
                span.classList.add('ok');
                this._status_message.classList.remove('warning', 'error', 'none');
                this._status_message.classList.add('ok');
                break;
            default:
                this._status_message.classList.remove('ok', 'error', 'warning');
                this._status_message.classList.add('none');
                break;
        }
        this._status_message.textContent = message;
        this._data.add_status(span);
        this.auto_scroll();
    }
    
    auto_scroll()
    {
        if(this._scroll.checked)
            this._data_content.scrollTop = this._data_content.scrollHeight;
    }
}