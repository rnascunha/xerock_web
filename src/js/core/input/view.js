import {Event_Emitter} from '../../libs/event_emitter.js';
import {Input_Type, Input_Events} from './types.js';

const input_html = `
        <div id=input-container>
            <h1 id=input-title>Input</h1>
            <textarea class=input-flex-item id=input-text-data placeholder='Type command' disabled title=Commands></textarea>
            </input-resize>
            <button class=input-flex-item id=send-button disabled title=Send></button>
            <select class=input-flex-item id=input-commands-list size=2' title='Command list'></select>
            <div class=input-flex-item id=input-options>
                <select id=input-select-app class=input-option-item></select>
                <div class=input-option-item>
                    <select id=input-data-type></select>
                    <label for=send-enter-box title='Enter to Send'>
                        <input type=checkbox id=send-enter-box checked>Enter
                    </label>
                </div>
                <select id=input-command class=input-option-item></select>
            </div>
        </div>`;

export class Input_View extends Event_Emitter
{
    constructor(model, container)
    {
        super();
        
        this._model = model;
        this._container = container;
        this._container.innerHTML = input_html;
        
        this._send_button = this._container.querySelector('#send-button');
        this._data_input = this._container.querySelector('#input-text-data');
        
        this._send_enter_check = this._container.querySelector('#send-enter-box');
        this._send_enter_check.addEventListener('change', ev => this.emit(Input_Events.CHANGE_STATE, this.state()));
        
        this._sel_message_type = this._container.querySelector('#input-data-type');
        
        Object.values(Input_Type).forEach(d => {
            let op = document.createElement('option');
            
            op.value = d.value;
            op.textContent = d.name;
            if('default' in d && d.default){
                op.selected = true;
                this._sel_message_type.dataset.pre = d.value;
            }
            this._sel_message_type.appendChild(op);
        });
        
        //Events
        this._sel_message_type.addEventListener('change', ev => {
            this._model.events(Input_Events.CHANGE_TYPE, {event: ev, 
                                                          state: this.state(), 
                                                          pre: this._sel_message_type.dataset.pre
                                                         });
            this._sel_message_type.dataset.pre = this._sel_message_type.selectedOptions[0].value;
            this._data_input.focus();
        });
        this._data_input.addEventListener('keydown', ev => { 
                                          if(this._model.events(Input_Events.INSERT_KEY, {event: ev, state: this.state()}))
                                              event.preventDefault();
        });
        this._send_button.addEventListener('click', ev => 
                                           this._model.events(Input_Events.SEND_INPUT, this.state()));
        this._data_input.addEventListener('paste', ev => {
                                          if(this._model.events(Input_Events.PASTE, {event: ev, state: this.state()}));
                                            event.preventDefault();
        });
                
        this._model.on(Input_Events.ENABLE, en => this.enable(en))
                    .on(Input_Events.SET_INPUT, args => this.set(args.data, args.type))
                    .on(Input_Events.SEND_INPUT, () => this.send_input())
                    .on(Input_Events.INSERT_INPUT, data => this.insert(data))
                    .on(Input_Events.CHANGE_TYPE, type =>  this.set_type(type))
        
        this._model.init(this._container.querySelector('#input-commands-list'),
                        this._container.querySelector('#input-command'));
    }
        
    enable(en)
    {
        this._send_button.disabled = !en;
        this._data_input.disabled = !en;
        if(en) this._data_input.focus();
    }
        
    set(data, type)
    {
        this._set_value(data);
        
        if(type)
            this.set_type(type);
    }
    
    send_input()
    {
        this._data_input.value = '';
        this._data_input.focus();
    }
    
    insert(data)
    {
        let cursor = this._data_input.selectionStart;
        this._data_input.value = this._data_input.value.slice(0, this._data_input.selectionStart) + 
                                    data + 
                                this._data_input.value.slice(this._data_input.selectionEnd);
        
        this._data_input.selectionEnd = cursor + data.length;        
    }
    
    set_type(type)
    {
        if(!(type in Input_Type)) return;
        if(this._sel_message_type.selectedOptions[0].value == type) return;
        
        this._sel_message_type.querySelectorAll('option').forEach(op => {
            if(op.value == type)
            {
                op.selected = true;
                this._sel_message_type.dataset.pre = this._sel_message_type.selectedOptions[0].value;
            }
        });
    }
    
    state(s = null)
    {
        if(s !== null)
        {
            if('type' in s) this.set_type(s.type);
            if('value' in s) this._set_value(s.value);    
            if('enter_send' in s) this._send_enter_check.checked = Boolean(s.enter_send);   
        }
        
        return {
            type: this._sel_message_type.selectedOptions[0].value,
            value: this._data_input.value,
            enter_send: this._send_enter_check.checked
        }
    }
    
    _set_value(value)
    {
        if(typeof value !== 'string') return;
        
        this._data_input.value = value;
    }
}