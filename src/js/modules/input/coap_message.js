import {Input_Events, Input_Type} from '../../core/input/types.js';
import {Command_Template} from '../../core/input/commands/commands.js';
import {copy_clipboard} from '../../helper/util.js';

import {CoAP_Message} from '../../protocol/coap/components/make_message.js';
import {code} from '../../protocol/coap/types.js';

import {Byte_Array} from '../../libs/byte_array/byte_array.js';
import {Data_Type} from '../../libs/byte_array/types.js';

const template = document.createElement('template');
template.innerHTML = `
<style>
    #container
    {
        width: 417px;
    }

    #error{
        width: 100%;
        box-sizing: border-box;
        --closeable-padding: 3px 6px;
        font-weight: bold;
    }

    #button-container
    {
        width: 100%;
        display: flex;
        flex-direction: row;
    }

    .flex-btn
    {
        cursor: pointer;
        margin: 0px;
        flex-basis: 1;
        padding: 5px;
        font-size: 25px;
    }

    #send-btn
    {
        flex-grow: 4;
    }
</style>
<div id=message></div>
<closeable-status id=error behaviour=hidden></closeable-status>
<div id=button-container>
    <button class=flex-btn id=copy-btn title="Copy">&#x2398;</button>
    <button class=flex-btn id=send-btn title=Send>&#x25B6;</button>
</div>`;

export class Input_CoAP_Message extends Command_Template
{
    constructor()
    {
        super('CoAP Message');
    }
        
    render()
    {
        const el = document.createElement('div');
        el.id = 'container';
        el.appendChild(template.content.cloneNode(true));
            
        const msg_el = el.querySelector('#message'),
              coap_message = new CoAP_Message(msg_el, {code: Object.values(code), code_container_type: 'select'}),
              error_el = el.querySelector('#error');
        
        msg_el.addEventListener('coap-change', ev => {
            let data = ev.detail;
            error_el.value = data.has_error ? data.error.join(' | ') : '';
        });
        
        const send_btn = el.querySelector('#send-btn'),
              message = el.querySelector('#message');
        
        el.querySelector('#copy-btn').addEventListener('click', ev => {
            let d = coap_message.serialize();
            if(d.has_error) return;
            copy_clipboard(Byte_Array.to(d.data, Data_Type.hex.value));
        });
                        
        send_btn.addEventListener('click', ev => {
            let d = coap_message.serialize();
            if(d.has_error) return;
            this.emit(Input_Events.SET_INPUT, {data: Byte_Array.to(d.data, Data_Type.hex.value) , type: Input_Type.hex.value});
        });
        
        send_btn.addEventListener('dblclick', ev => {
            let d = coap_message.serialize();
            if(d.has_error) return;
            this.emit(Input_Events.SEND_INPUT, {data: Byte_Array.to(d.data, Data_Type.hex.value) , type: Input_Type.hex.value});
        });
        
        return el;
    }
}
