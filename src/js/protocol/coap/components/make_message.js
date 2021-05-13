import * as coap from '../coap.js';

import {Button_Pusher} from '../../../components/button_pusher.js';
import '../../../components/closeable-status.js';

import {Byte_Array} from '../../../libs/byte_array/byte_array.js';
import {Data_Type} from '../../../libs/byte_array/types.js';

function remove_leading_zeros(data)
{
    let flag = false;
    let n_data = data.filter(d => {
        if(!flag && d == 0) return false;
        else {
            flag = true;
            return true;
        }
    });
    
    return n_data;
}

function make_code_select(data)
{
    const sel = document.createElement('select');
    sel.classList.add('header-field');
    data.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.value;
        opt.textContent = `${d.str_code} ${d.name}`;
        
        sel.appendChild(opt);
    });
    
    return sel;
}

const template = document.createElement('template');
template.innerHTML = `
<style>
    #message{
        min-width: 300px;
        margin: 0px;
        padding: 1px;
        background-color: aliceblue;
        box-sizing: border-box;
    }

    #message-config{
        width: 100%;
        padding: 5px;
        background-color: beige;
        border-radius: 10px;
        box-sizing: border-box;
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        align-items: center;
    }

    #connection-type{
        --button-pusher-bt-bg: orange;
    }

    #message-size{
        width: 10ch;
        height: 2.5ch;
        border-radius: 5px;
        text-align: center;
        background: orange;
    }

    #message-length{
        width: 10ch;
        height: 2.5ch;
        border-radius: 5px;
        text-align: center;
    }

    #message-config label{
        font-weight: bold;
    }

    #message-header{
        width: 100%;
        padding: 5px;
        background-color: orange;
        border-radius: 10px;
        box-sizing: border-box;
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        justify-content: stretch;
    }

    .header-field{
        --button-pusher-bt-bg: peachpuff;
    }

    #message-header label{
        font-weight: bold;
    }

    #message-version{
        width: 2ch;
        height: 2.5ch;
        border-radius: 5px;
    }

    #message-id{
        width: 12ch;
        height: 2.5ch;
    }

    #message-code{
        margin: 0px;
        padding: 0px;
    }

    #message-code select{
        padding: 3px;
        border-radius: 5px;
        background: white;
    }

    #message-token{
        width: 100%;
        height: 2.5ch;
        max-width: 28ch;
    }

    #message-options{
        display: flex;
        flex-direction: column;
        padding: 5px;
        background-color: bisque;
        border-radius: 10px;
    }

    #message-option-header{
        display: flex;
        justify-content: space-between;
    }

    #message-option-header span{
        font-weight: bold;
    }

    #add-option
    {
        color: lawngreen;
        background-color: white;
        font-weight: bold;
        transition: background-color 0.5s ease;
        cursor: pointer;
        border-style: outset;
        border-radius: 5px;
    }

    #add-option:hover
    {
        color: white;
        background-color: lawngreen;
    }

    #add-option:active
    {
        border-style: inset;
    }

    #message-option-container
    {
        max-height: 200px;
        flex-grow: 1;
        margin-top: 2px;
        overflow: auto;
    }

    .coap-option
    {
        width: 100%;
        background-color: white;
        --closeable-close-bg: white;
        --closeable-bg-hover: red;
        --closeable-padding: 5px;
        --closeable-close-color: red;
        --closeable-color-hover: white;
        margin-bottom: 2px;
        box-sizing: border-box;
        color: black;
    }

    .coap-op-invalid{
        display: none;
        font-style: italic;
    }

    .coap-option-select{
        border-style: none;
        padding: 3px;
        border-radius: 5px;
        background-color: antiquewhite;
    }

    .coap-op-container-value{
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 2px;
    }

    .coap-op-value{
        flex-grow: 1;
    }

    .coap-op-field-value{
        padding: 3px;
        border-radius: 5px;
        width: 100%;
        box-sizing: border-box;
        background-color: antiquewhite;
        --token-data-bg: antiquewhite;
    }

    #container-payload{
        width: 100%;
        padding: 5px;
        box-sizing: border-box;
        background-color: yellow;
        border-radius: 10px;
    }

    #container-payload label
    {
        display: block;
        font-weight: bold;
    }

    #payload-size
    {
        font-weight: normal;
    }

    #message-payload{
        width: 100%;
        box-sizing: border-box;
        max-height: 200px;
        background-color: cornsilk;
    }
</style>
<div id=message>
    <div id=message-config>
        <button-pusher id=connection-type title='Connection Type'></button-pusher>
        <label>Size: <input id=message-size disabled></label>
    </div>
    <div id=message-header>
        <div class=header-field>
            <input type=checkbox id=set-length class=reliable title='Set Length\nTCP: check\nWebsocket: uncheck' checked>
            <label class=reliable>Length: <input disabled id=message-length></label>
            <label class=unreliable>Ver: <input id=message-version value='01' disabled title=Version></label>
            <label title='Message ID' class=unreliable>M.ID: <message-id-field id=message-id></message-id-field></label>
        </div>
        <button-pusher class='header-field unreliable' id=message-type title=type></button-pusher>
        <div id=message-code></div>
        <token-field class=header-field id=message-token title=token placeholder=token max-size=8></token-field>
    </div>
    <div id=message-options>
        <div id=message-option-header>
            <span>Options</span><button id=add-option title='Add option'>+</button>
        </div>
        <div id=message-option-container></div>
    </div>
    <div id=container-payload>
        <convert-container id=message-payload types='["text", "hex", "binary"]' select='text' contentEditable></convert-container>
        <label>Payload Size: <span id=payload-size>0</span></label>
    </div>
</div>`;

const template_block = document.createElement('template');
template_block.innerHTML = `
<style>
    .coap-block-container{
        width: 100%;
        box-sizing: border-box;
    }

    .coap-block-number
    {
        max-width: 15ch;
        box-sizing: border-box;
        padding: 3px;
        border-radius: 5px;
        background-color: antiquewhite;
    }

    .coap-block-size-select
    {
        padding: 3px;
        border-radius: 5px;
        background-color: antiquewhite;
    }
    
    .coap-block-container label{font-weight: bold;}
</style>
<span class=coap-block-container>
    <input type=number placeholder=Number class=coap-block-number min=0 title='Packet Number'>
    <label title=More>M<input type=checkbox class=coap-block-more></label>
    <select class=coap-block-size-select title='Max Packet Size'>
        <option value=0>16</option>
        <option value=1>32</option>
        <option value=2>64</option>
        <option value=3>128</option>
        <option value=4>256</option>
        <option value=5>512</option>
        <option value=6>1024</option>
        <option value=7>BERT</option>
    </select>
</span>`;

export class CoAP_Message{
    constructor(container, config = {})
    {
        this._ext_container = container;
        this._container = container.attachShadow({mode: 'open'});
        
        let type = config.type === null ? null : (config.type instanceof Array ? config.type : Object.values(coap.type)),
            code = config.code === null ? null : (config.code instanceof Array ? config.code : Object.values(coap.request)),
            option = config.option === null ? null : (config.option instanceof Array ? config.option : Object.values(coap.option)),
            payload = config.payload === undefined ? true : Boolean(config.payload),
            content_format = config.content_format === null ? null : (config.content_format instanceof Array ? config.content_format : Object.values(coap.content_format)),
            connection_type = !config.connection_type ? Object.values(coap.connection_type) : config.connection_type;
        
        this._conn_type = Array.isArray(connection_type) ? 
                            connection_type[0].value : 
                            (connection_type == 'reliable' ? 'reliable' : 'unreliable');
        this._container.appendChild(template.content.cloneNode(true));
        this._draw(connection_type, type, code, option, payload, content_format, config.code_container_type);
    }
    
    get node(){ return this._container; }
        
    data()
    {   
        let error = [],
            data = {
                conn_type: this._conn_type,
                length_set: this._container.querySelector('#set-length').checked,
                version: +this._container.querySelector('#message-version').value,
                mid: this.data_mid(),
                type: this.data_type(),
                code: this.data_code(),
                token: this._container.querySelector('#message-token').byte_array(),
                option: this.parse_options(error),
                payload: this._container.querySelector('#message-payload').data()
            };
        
        if(!data.type && this._conn_type == 'unreliable')
        {
            CoAP_Message.set_error(error, 'header', 'type', 'value not set');
        }
        if(!data.code)
        {
            CoAP_Message.set_error(error, 'header', 'code', 'value not set');
        }

        if(!data.mid.data.length && this._conn_type == 'unreliable')
        {
            CoAP_Message.set_error(error, 'header', 'mid', 'value not set');
        }        
        
        return {
            data: data, error: error, has_error: Boolean(error.length)
        };
    }
    
    serialize()
    {
        return this._conn_type == 'reliable' ? this.serialize_reliable() : this.serialize_unreliable();
    }
    
    serialize_unreliable()
    {
        let d = this.data();
        if(d.has_error) return {data: [], error: ['parser error'], has_error: true};
        
        d = d.data;
        let options = [];
        d.option.forEach(op => {
            let nop = new coap.message.option(op.code, op.value);
            if(!nop)
            {
                return;// {data: [], error: ['option error'], has_error: true};
            }
            options.push(nop);
        });
        return coap.message.serialize(d.type.code, d.code.code, d.mid.value, d.token, options, d.payload);
    }
    
    serialize_reliable()
    {
        let d = this.data();
        if(d.has_error) return {data: [], error: ['parser error'], has_error: true};
        
        d = d.data;
        let options = [];
        d.option.forEach(op => {
            let nop = new coap.message.option(op.code, op.value);
            if(!nop)
            {
                return;
            }
            options.push(nop);
        });
        
        return coap.message.serialize_reliable(d.code.code, 
                                               d.token, 
                                               options, 
                                               d.payload, 
                                               d.length_set);
    }
    
    data_mid()
    {
        return {
            value: +this._container.querySelector('#message-id').value, 
            data: this._container.querySelector('#message-id').byte_array()
        };
    }
    
    data_type()
    {
        let v = this._container.querySelector('#message-type').selected();
        return {value: v, code: coap.type[v].code};
    }
    
    data_code()
    {
        const f = this._container.querySelector('#message-code .header-field');
        let v = f.localName == 'select' ? f.value : f.selected();

        return {value: v, code: coap.code[v].code};
    }
    
    connection_type(val = null)
    {
        if(val != null)
        {
            if(val == 'reliable')
            {
                this._container.querySelectorAll('.reliable').forEach(r => {
                   r.style.display = 'inline-block'; 
                });
                this._container.querySelectorAll('.unreliable').forEach(r => {
                   r.style.display = 'none'; 
                });
                this._conn_type = val;
            }
            else if(val == 'unreliable')
            {
                this._container.querySelectorAll('.reliable').forEach(r => {
                   r.style.display = 'none'; 
                });
                this._container.querySelectorAll('.unreliable').forEach(r => {
                   r.style.display = 'inline-block'; 
                });
                this._conn_type = val;
            }
        }
        return this._conn_type;
    }
    
    _set_message_size(s_data)
    {
        const size_el = this._container.querySelector('#message-size');        
        if(s_data.has_error)
            size_el.value = '';
        else
            size_el.value = s_data.data.length;
    }
    
    _set_message_length(s_data)
    {
        const length_check = this._container.querySelector('#set-length').checked,
              length = this._container.querySelector('#message-length');
        
        if(length_check)
        {
            const d = coap.message.parse_reliable(s_data.data, true);
            length.value = d.has_error ? 0 : d.size - d.header_size;
        }
        else
        {
            length.value = 0;
        }
    }
    
    _coap_change_event(ev)
    {
        const dd = this.serialize();
            
         this._set_message_size(dd);
         this._set_message_length(dd);
         this._ext_container.dispatchEvent(new CustomEvent('coap-change', {detail: dd}));
    }
    
    _draw(connection_type, type, code, option, payload, content_format, code_container_type)
    {
        if(Array.isArray(connection_type) && connection_type.length == 2)
        {
            const c = this._container.querySelector('#connection-type');
            c.add(connection_type);
            c.select(this._conn_type);
            
            c.addEventListener('click', ev => {
                let b = ev.composedPath()[0];
                if(b.value) this.connection_type(b.value);
            });
        }
        else
        {
            this._container.querySelector('#message-config').style.display = 'none';
            if(connection_type == 'reliable' || connection_type == 'unreliable')
                this.connection_type(connection_type);
            else
                this._conn_type(this._conn_type);
        }
        
        if(type)
        {
            let t = this._container.querySelector('#message-type');
            t.add(type);
            t.select(type[0].value);
        }
        else
        {
            this._container.querySelector('#message-type').style.display = 'none';
        }

        if(code)
        {
            let code_container = this._container.querySelector('#message-code');
            
            if(code_container_type == 'select')
            {
                code_container.appendChild(make_code_select(code));
            }
            else
            {
                let code_data = new Button_Pusher(code);

                code_data.classList.add('header-field')
                code_data.title = 'Code';
                code_data.select(code[0].value);

                code_container.appendChild(code_data);
            }
        }
        else
        {
            this._container.querySelector('#message-code').style.display = 'none';
        }

        if(option)
        {
            const template_op = document.createElement('template');
            template_op.innerHTML = CoAP_Message.create_template_option(option);
            
            const template_cf = document.createElement('template');
            template_cf.innerHTML = CoAP_Message.create_template_content_format(content_format);
            
            let bt_add_op = this._container.querySelector('#add-option');
            bt_add_op.addEventListener('click', ev => {
                this._container
                    .querySelector('#message-option-container')
                    .appendChild(template_op.content.cloneNode(true));
            });
            
            this._container.querySelector('#message-option-container').addEventListener('change', ev => {
                let path = ev.composedPath()[0];
                if(!path.classList.contains('coap-option-select')) return;

                let op = option.find(o => o.value == path.selectedOptions[0].value);
                if(!op) return;
                let field = path.parentElement.querySelector('.coap-op-value');

                CoAP_Message.make_op_field_value(field, op, template_cf);
            });
        }
        else
        {
            this._container.querySelector('#message-options').style.display = 'none';
        }
        
        if(!payload)
        {
            this._container.querySelector('#container-payload').style.display = 'none';
        }
        else
        {
            let f = this._container.querySelector('#message-payload'),
                s = this._container.querySelector('#payload-size');
            f.addEventListener('keyup', ev => {
                s.textContent = f.size;
            });
        }
        this.connection_type(this._conn_type);
        
        this._container.addEventListener('click', this._coap_change_event.bind(this));
        this._container.addEventListener('keyup', this._coap_change_event.bind(this));
    }
        
    parse_options(error)
    {
        let options = [];
        this._container
            .querySelector('#message-option-container')
            .querySelectorAll('.coap-op-container-value').forEach(op => {
           let op_code = op.querySelector('.coap-option-select').selectedOptions[0].value,
               container_value = op.querySelector('.coap-op-value');
            if(!(op_code in coap.option)) return;
            
            if(op_code == coap.option.accept.value
              || op_code == coap.option.content_format.value)
            {
                let op_value = container_value.querySelector('.coap-option-select').selectedOptions[0].value;
                options.push({
                    code: coap.option[op_code].code, 
                    option: op_code, 
                    value: coap.content_format[op_value].code, 
                    name: op_value
                });
                return;
            }
            else if(op_code == coap.option.no_response.value)
            {
                let op_value = container_value.querySelector('.coap-op-input-value').selected();
                let data = 0;
                if(op_value)
                {
                    op_value.forEach(nr => {
                        data |= coap.no_response[nr].code;
                    });
                }
                options.push({
                    code: coap.option[op_code].code, 
                    option: op_code, 
                    value: data, 
                    name: op_value
                });
                return;
            }
            if(op_code == coap.option.block1.value
              || op_code == coap.option.block2.value)
            {
                const num = container_value.querySelector('.coap-block-number'),
                    more = container_value.querySelector('.coap-block-more'),
                    size = container_value.querySelector('.coap-block-size-select'),
                    bdata = {
                        szx: +size.value,
                        size: +size.value == 7 ? size.selectedOptions[0].textContent : +size.selectedOptions[0].textContent,
                        more: more.checked ? 1 : 0,
                        number: +num.value,
                        value: +size.value | (more.checked << 3) | (+num.value << 4)
                    },
                    v = remove_leading_zeros(Byte_Array.parse(bdata.value, Data_Type.uint32be.value));
                
                options.push({
                    code: coap.option[op_code].code, 
                    option: op_code, 
                    value: v, 
                    name: bdata
                });
                return;
            }
            else
            {
                let opt = coap.option[op_code];
                switch(opt.type)
                {
                    case 'empty':
                        options.push({
                            code: coap.option[op_code].code, 
                            option: op_code, value: null, name: 'empty'
                        });
                        break;
                    case 'uint':
                    {
                        let v = container_value.querySelector('.coap-op-input-value').value;              
                        options.push({
                            code: coap.option[op_code].code,
                            option: op_code, 
                            value: +v,
                            name: +container_value.querySelector('.coap-op-input-value').value
                        });
                    }
                        break;
                    case 'string':
                    {
                        options.push({
                            code: coap.option[op_code].code, 
                            option: op_code,
                            value: container_value.querySelector('.coap-op-input-value').value,
                            name: container_value.querySelector('.coap-op-input-value').value
                        });
                    }
                        break;
                    case 'opaque':
                    {
                        let cc = container_value.querySelector('.coap-op-input-value');
                        options.push({
                            code: coap.option[op_code].code, 
                            option: op_code, 
                            value: cc.byte_array(), 
                            name: cc.text
                        });
                    }
                        break;
                    default:
                        break;
                }
            }
        });
        return options;
    }
    
    static set_error(error_arr, type, value, error)
    {
        return error_arr.push({type: type, value: value, error: error});
    }
    
    static create_template_option(options = null)
    {
        options = options == null ? Object.values(coap.option) : options;

        let str = `<closeable-status show=true behaviour=close class=coap-option>
                        <div class=coap-op-container-value><select class=coap-option-select>
                            <option value=invalid class=coap-op-invalid>Options</option>`;

        options.forEach(op => {
            str += `<option value=${op.value}>${op.name}</option>`;
        });
        str += '</select><span class=coap-op-value></span></div></closeable-status>'

        return str;
    }

    static create_template_content_format(content_format)
    {
        let str = '<select class="coap-option-select coap-op-input-value">';
        content_format.forEach(op => {
            str += `<option value=${op.value}>${op.name}</option>`;
        });
        str += '</select>';
        return str;
    }
    
    static make_op_field_value(field, op, template_cf)
    {
        field.innerHTML = '';

        if(op.value == coap.option.accept.value 
           || op.value == coap.option.content_format.value)
        {
            field.appendChild(template_cf.content.cloneNode(true));
            return;
        }

        if(op.value == coap.option.no_response.value)
        {
            let i = new Button_Pusher(Object.values(coap.no_response));
            i.classList.add('coap-op-input-value');
            i.multi = true;
            field.appendChild(i);
            return;
        }
        
        if(op.value == coap.option.block1.value
          || op.value == coap.option.block2.value)
        {
            field.appendChild(CoAP_Message.make_op_block_field());
            return;
        }

        switch(op.type)
        {
            case 'empty':
                break;
            case 'uint':
                {
                    let i = document.createElement('input');
                    i.type = 'number';
                    i.min = `${Math.pow(2, op.min) - 1}`;
                    i.max = `${Math.pow(2, 8 * op.max) - 1}`;
                    i.classList.add('coap-op-field-value', 'coap-op-input-value');
                    i.style.maxWidth = '20ch';
                    if(op.default) i.value = op.default;

                    field.appendChild(i);
                    i.focus();
                }
                break;
            case 'string':
                {
                    let i = document.createElement('input');
                    i.type = 'text';
                    i.minLength = `${op.min}`;
                    i.maxLength = `${op.max}`;
                    i.classList.add('coap-op-field-value', 'coap-op-input-value');

                    field.appendChild(i);
                    i.focus();
                }
                break;
            case 'opaque':
            {
                let i = document.createElement('token-field');
                i.classList.add('coap-op-field-value', 'coap-op-input-value');
                i.max_size = op.max;
                i.style.padding = '0px';
                field.appendChild(i);
                
                i.focus();
            }
                break;
            default:
                break;
        }
    }
    
    static make_op_block_field()
    {
        return template_block.content.cloneNode(true);
    }
}
