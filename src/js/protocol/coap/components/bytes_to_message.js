import {Byte_Array} from "../../../libs/byte_array/byte_array.js";
import {Data_Type} from "../../../libs/byte_array/types.js";

import * as coap from '../coap.js';
import {coap_message_display} from './show_message.js';

const template = document.createElement("template");
template.innerHTML = `
<style>
    #byte-code-parse {
        width: 100%;
        display: inline-flex;
        flex-direction: column;
        background-color: bisque;
        padding: 2px;
        box-sizing: border-box;
        border-radius: 4px;
    }

    #byte-code-input {
        width: 100%;
        padding: 2px;
        border-radius: 5px;
        box-sizing: border-box;
    }

    #byte-code-error {
        padding: 2px;
        border-radius: 5px;
        background-color: red;
        color: white;
    }
    
    label {
        cursor: pointer;
    }

    label:hover{
        text-shadow: 0 0 black;
    }

</style>
<div id=byte-code-parse>
    <textarea id=byte-code-input placeholder="Paste 'hexa' format byte code" rows=3></textarea>
    <div>
        <label><input type=radio value=unreliable name=coap-bc-type>Unreliable</label>
        <label><input type=radio value=reliable name=coap-bc-type>Reliable</label>
        <label id=coap-bc-set-length-label><input type=checkbox value=set_length id=coap-bc-set-length checked>Set Length</label>
    </div>
    <div id=byte-code-error></div>
</div>
<div id=byte-code-parsed-output></div>`;

export function bytes_to_message(container)
{
    let shadow;
    if(!container.shadowRoot)
        shadow = container.attachShadow({mode: 'open'});
    else
    {
        shadow = container.shadowRoot;
        shadow.innerHTML = '';
    }
    shadow.appendChild(template.content.cloneNode(true));
    
    //Byte code parse
    const bc_input = shadow.querySelector("#byte-code-input"),
          bc_radio = shadow.querySelectorAll("input[name='coap-bc-type']"),
          bc_set_length = shadow.querySelector("#coap-bc-set-length"),
          bc_set_length_label = shadow.querySelector("#coap-bc-set-length-label"),
          bc_output = shadow.querySelector("#byte-code-parsed-output"),
          bc_error = shadow.querySelector("#byte-code-error");
    
    const set_error = (error) => {
        if(!error) {
            bc_error.textContent = '';
            bc_error.hidden = true;
            return;
        }
        bc_error.textContent = error;
        bc_error.hidden = false;
    }

    const parse_byte_code = () => {
        if(!bc_input.value.length) return;

        try{
            let arr = Byte_Array.parse(bc_input.value, Data_Type.hex.value),
                bc_parse = bc_radio[0].checked ? 
                            coap.message.parse(arr) : 
                            coap.message.parse_reliable(arr, bc_set_length.checked);

            if(bc_parse.has_error) throw {code: 99, message: bc_parse.error[0]};
            coap_message_display(bc_output, bc_parse);
            set_error('');
        } catch(e) {
            if(typeof e.message == 'string') 
                set_error(e.message);
            else
                set_error(e.message.error[0]);
            console.log(e);
        }
    }

    bc_radio[0].addEventListener("change", ev => {
        if(bc_radio[0].checked) bc_set_length_label.hidden = true;
        parse_byte_code();
    });

    bc_radio[1].addEventListener("change", ev => {
        if(bc_radio[1].checked) bc_set_length_label.hidden = false;
        parse_byte_code();
    });
    bc_set_length.addEventListener("change", parse_byte_code);

    bc_set_length_label.hidden = true;
    bc_radio[0].checked = true;

    bc_input.addEventListener("keyup", parse_byte_code);
    bc_input.addEventListener("paste", parse_byte_code);
    set_error();
}