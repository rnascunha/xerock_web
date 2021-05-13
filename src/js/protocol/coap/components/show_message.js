import * as coap from '../coap.js';

import {Byte_Array} from '../../../libs/byte_array/byte_array.js';
import {Data_Type} from '../../../libs/byte_array/types.js';

const template_display = document.createElement('template');
template_display.innerHTML = `
<style>
    :host{
        display: inline-flex;
        flex-direction: column;
    }

    .container{
        display: inline-flex;
        flex-wrap: wrap;
        gap: 2px;
        padding: 5px;
        box-sizing: border-box;
    }

    .container-field{
        display: flex;
        border-radius: 10px;
        align-items: center;
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

    #message-size{
        width: 10ch;
        height: 2.5ch;
        border-radius: 5px;
        text-align: center;
    }

    #message-config label{
        font-weight: bold;
    }

    .header{
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        font-weight: bold;
        font-size: 20px;
        padding: 4px 0px 4px 0px;
    }

    #container-header{
        background-color: orange;
    }

    #container-option{
        background-color: bisque;
    }

    #container-payload{
        background-color: yellow;
        flex-grow: 1;
    }

    #container-payload label{
        font-weight: bold;
    }

    #payload-size{
        font-weight: normal;
    }

    #payload{
        padding: 0px;
        background-color: cornsilk;
        flex-wrap: nowrap;
        height: 100%;
    }

    /* fields */
    .coap-op{
        display: inline-flex;
    }

    .coap-op{
        border-radius: 5px;
        overflow: hidden;
    }

    .field{
        padding: 3px;
    }

    .name{
        font-weight: bold;
    }

    .coap-op.type-config .name
    {
        background-color: orange;
    }

    .coap-op.type-header .name
    {
        background-color: peachpuff;
    }

    .coap-op.type-option .name
    {
        background-color: snow;
    }

    .value{
        background-color: green;
        color: white;
    }

    #payload-content
    {
        display: inline-flex;
        flex-direction: column;
        flex-grow: 1;
        align-self: stretch;
        padding: 5px;
    }
</style>
<div id=message-config>
</div>
<div id=container-header class=container-field>
    <div id=header-header class=header>Header</div>
    <div id=header class=container></div>
</div>
<div id=container-option class=container-field>
    <div id=option-header class=header>Option</div>
    <div id=option class=container></div>
</div>
<div id=container-payload class=container-field>
    <div id=payload-header class=header>Payload</div>
    <div id=payload-content>
        <convert-container id=payload types='["text", "hex", "binary"]' select="text" class=container></convert-container>
        <label>Payload Size: <span id=payload-size>0</span></label>
    </div>
</div>
`;

const template_display_ob = document.createElement('template');
template_display_ob.innerHTML = `
<div class=coap-op>
    <div class='name field'></div>
    <div class='value field'></div>
</div>`;

export function coap_message_display(container, sdata, show_config = {})
{
    let shadow;
    if(!container.shadowRoot)
        shadow = container.attachShadow({mode: 'open'});
    else
    {
        shadow = container.shadowRoot;
        shadow.innerHTML = '';
    }
    shadow.appendChild(template_display.content.cloneNode(true));
    
    const config = shadow.querySelector('#message-config'),
          header = shadow.querySelector('#header'),
          option = shadow.querySelector('#option'),
          coption = shadow.querySelector('#container-option'),
          payload = shadow.querySelector('#payload'),
          cpayload = shadow.querySelector('#container-payload');
    
    show_config = typeof show_config == 'object' ? show_config : {};
    const show_header = ('show_header' in show_config) ? Boolean(show_config.show_header) : true,
          show_unused = ('show_unused' in show_config) ? Boolean(show_config.show_unused) : false,
          show_config_f = ('show_config' in show_config) ? Boolean(show_config.show_config) : true;
    
    if(!show_header)
    {
        shadow.querySelectorAll('.header').forEach(h => { h.style.display = 'none'} );
    }
    
    if(!show_config_f)
        config.style.display = 'none';
    
    function make_op(name, value, type, title = '')
    {
        const el_clone = template_display_ob.content.cloneNode(true),
              el = el_clone.querySelector('.coap-op');
        el.querySelector('.name').textContent = name;
        el.querySelector('.value').textContent = value;
        el.classList.add('type-' + type);
        
        if(title)
        {
            el.title = title;
        }
        
        return el_clone;
    }
    
    const data = sdata.data;
    
    config.appendChild(make_op('Conn', coap.connection_type[sdata.conn_type].name, 'config', 'Connection type: ' + sdata.conn_type));
    config.appendChild(make_op('Size',  sdata.size, 'config', 'Total message size: header + options + payload'));

    if(sdata.conn_type == 'unreliable')
    {
        header.appendChild(make_op('Version', '0' + data.version, 'header'));
        header.appendChild(make_op('Type', `${data.type.code} | ${data.type.value}`, 'header'));
        header.appendChild(
            make_op('M.ID', '0x' + Byte_Array.convert(`${data.mid.value}`, 
                                                      Data_Type.uint16be.value, Data_Type.hex.value), 
                    'header',
                            `Message ID: ${data.mid.value}`));
    }
    else
    {
        header.appendChild(make_op('Length', data.length, 
                                   'header', 
                                   `Length set: ${sdata.setted_length} (options size + payload marker + payload size)`));
    }
    header.appendChild(make_op('Code', `${coap.code[data.code.value].str_code} | ${data.code.value}`, 'header'));
    header.appendChild(
        make_op('Token', 
                `[${data.token_len}] ${Byte_Array.to(data.token, Data_Type.hex.value)}`, 
                'header',
                `[token length] token: [${data.token_len}] ${Byte_Array.to(data.token, Data_Type.text.value)}`));
    
    if(!data.options.data.length)
    {
        if(!show_unused)
            coption.style.display = 'none';
    }
    else
    {
        data.options.data.forEach(op => {
            let title = `code: ${op.data.code}
opt value: ${op.data.op_value}
length: ${op.data.length}
opt size: ${op.data.size}
raw data: ${Byte_Array.to(op.data.data, Data_Type.hex.value)}
checked: ${op.data.checked}`;
            option.appendChild(make_op(op.data.code + ' | ' + coap.option[op.data.op_value].name, 
                                      op.data.special ? op.data.str_data + ' | ' + op.data.special : op.data.str_data,
                                       'option',
                                       title)); 
        });
    }
    
    if(!data.payload.length)
    {
        if(!show_unused)
            cpayload.style.display = 'none';
    }
    else
    {
        payload.value(Byte_Array.to(data.payload, Data_Type.hex.value), Data_Type.hex.value);
        shadow.querySelector('#payload-size').textContent = data.payload.length;
    }
}
