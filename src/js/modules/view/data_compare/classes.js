import {Byte_Array} from '../../../libs/byte_array/byte_array.js';
import {Data_Type} from '../../../libs/byte_array/types.js';
import {Byte_Array_Base} from '../../../libs/byte_array/base.js';
import {Byte_Array_String} from '../../../libs/byte_array/string.js';

import {event_path} from '../../../helper/compatibility.js';

const default_data_compare_options = {
    break_line: 'break-new-line',
    views: [],
};

const default_view_options = {
    type: Data_Type.text.value
}

function to_char(value)
{
    return Byte_Array_String.is_ascii_int(value) 
            ? String.fromCharCode(value)
            : '\\x' + Byte_Array_Base._set_data_opt(Byte_Array_Base.to_hex_string(value), { pad_size: 2, pad_char: '0'});
}

function to_hex(value)
{
    return value.toString(16).padStart(2, '0');
}

function to_binary(value)
{
    return value.toString(2).padStart(8, '0');
}

function data_to_array(data)
{
    if(Array.isArray(data)) return data;
    if(typeof data === 'string') return Byte_Array.parse(data, Data_Type.text.value);
    if(data instanceof Uint8Array) return Array.from(data);
    
    return null;
}

const view_html = `
    <div class=view>
        <div class=view-options>
            <select class=output-type title='Output Type'>
                <option value=text>Text</option>
                <option value=hex>Hexa</option>
                <option value=binary>Binary</option>
            </select>
            <div class=close>&times;</div>
        </div>
        <pre class=view-data></pre>
    </div>
`;

const template_view = document.createElement('template');
template_view.innerHTML = view_html;

class View
{
    constructor(id, manager, options = {})
    {
        let op = {...default_view_options, ...options};
        
        this._id = id;
        this._manager = manager;
        this._element = document.importNode(template_view.content, true).querySelector('.view');
        this._element.dataset.id = id;
        this._data = this._element.querySelector('.view-data');
        
        this.type = op.type;
        
        let output_type = this._element.querySelector('.output-type');
        output_type.addEventListener('change', ev => {
            this._type = ev.target.selectedOptions[0].value;
            manager.add_all_messages(this);
        });
        
        output_type.value = this._type;
    }
    
    get id(){ return this._id; }
    get element(){ return this._element; }
    get type(){ return this._type; }
    
    set type(val)
    {
        let output_type = this._element.querySelector('.output-type');
        output_type.value = val;
        this._type = val;
    }
    
    remove()
    {
        this._element.parentNode.removeChild(this._element);
        this._manager = null;
    }
    
    add_message(message)
    {
        message.forEach(el => this._data.appendChild(el));
    }
    
    clear()
    {
        this._data.innerHTML = '';
    }
}

export class Data_Compare
{
    constructor(container, options = {})
    {
        this._view_id = 0;
        
        this._container = container;
        this._options = {...default_data_compare_options, ...options};
        this._views = [];
        this._messages = [];
                
        this._container.addEventListener('click', ev => {
            let id = event_path(ev)[0];
            if(id.classList.contains('close'))
            {
                while((!('id' in id.dataset)))
                    id = id.parentNode;
                
                this.close_view(id.dataset.id);
            }
        });
        
        this._style = document.createElement('style');
        this._container.prepend(this._style);
        
        this.break_line(this._options.break_line);
        
        this._options.views.forEach(op_view => this.add_view(op_view));
    }
    
    add_view(options = {})
    {
        let new_view = new View(this._view_id++, this, options);
        this._container.appendChild(new_view.element);
        
        this._views.push(new_view);
        this.add_all_messages(new_view);
    }
    
    close_view(id)
    {
        this._views = this._views.filter(v => {
            if(v.id == id)
            {
                v.remove();
                return false;
            }
            return true;
        });
    }
    
    add_message(data, received = true)
    {
        data = data_to_array(data);
        this._messages.push({data: data, received: received});
        
        this._views.forEach(view => {
            view.add_message(this.create_message(data, view.type, received));
        });
    }
    
    add_status(element)
    {
        element.textContent = '\n' + element.textContent + '\n';
        this._messages.push(element);
        this._views.forEach(view => view.add_message([element.cloneNode(true)]));
    }
    
    add_all_messages(view)
    {
        view.clear();
        this._messages.forEach(data => {
            if(data instanceof HTMLElement)
                view.add_message([data]);
            else
                view.add_message(this.create_message(data.data, view.type, data.received));
        });
    }
    
    create_message(data, type, received)
    {
        let message = [];
        
        if(!received)
        {
            let break_line = document.createElement('span');
            break_line.textContent = '\n';
            message.push(break_line);
        }
        
        data.forEach((d, idx) => {
            let byte = document.createElement('span');
            byte.classList.add('char', 'char' + d.toString(16));
            if(!received){
                byte.classList.add('sent');
            }
            
            switch(type)
            {
                case Data_Type.text.value:
                    byte.textContent = to_char(d);
                    break;
                case Data_Type.hex.value:
                    byte.textContent = to_hex(d) + ((idx % 2) ? ' ' : '');
                    break;
                case Data_Type.binary.value:
                    byte.textContent = to_binary(d) + ' ';
                    break;
                default:
            }
            message.push(byte);
        });
        
        if(!received)
        {
            let break_line = document.createElement('span');
            break_line.textContent = '\n';
            message.push(break_line);
        }
        
        let end_message = document.createElement('span');
        end_message.classList.add('message');
        message.push(end_message);
        
        return message;
    }
    
    clear()
    {
        this._messages = [];
        this._views.forEach(view => view.clear());
    }
    
    break_line(break_type, arg)
    {
        switch(break_type)
        {
            case 'break-new-line':
                this._style.innerHTML = ".chara:after{ content: '\\000a'; }";
                break;
            case 'break-fixed-char': 
                this._style.innerHTML = `.view-data .char:nth-of-type(${arg}n):after{ content: '\\000a'; }`;
                break;
            case 'break-message': 
                this._style.innerHTML = ".message:after{ content: '\\000a'; }";
                break;
        }
    }
}
