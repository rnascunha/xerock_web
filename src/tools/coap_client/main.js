import * as coap from './../../js/protocol/coap/coap.js';
import {draw_resource_tree} from './draw_resource_tree.js';
import {Input_URL} from '../../js/components/input_url.js';

import {coap_byte_code} from '../../js/protocol/coap/components/byte_message.js';
import {CoAP_Message} from '../../js/protocol/coap/components/make_message.js';
import {coap_message_display} from '../../js/protocol/coap/components/show_message.js';

let weblink_data = '</>,</time>;title=\'time of device\';rt="teste/link1";ct="40 111";obs,</dynamic>;ct=10;rt=20,</separate>;rel=teste/asd,</actuators/gpio0>,</actuators/gpio1>,</actuators/gpio2>,</sensors/temp>,</sensors/light>,</sensors/light/l1>,</sensors/light/l2>,</sensors/humidity>;title=minha umidade';

weblink_data = '<.well-known/core>,' + weblink_data;

let raw_data = coap.Weblink.make_tree(weblink_data);
document
    .querySelector("#resource")
    .appendChild(draw_resource_tree(raw_data).node());

let input = new Input_URL(coap.protocol);
input.addr('127.0.0.1');
input.port(5683);

document.querySelector('#url').appendChild(input);

const create_container = document.querySelector('#coap-create-message'),
      parsed_container = document.querySelector('#coap-parsed-message'),
      byte_code_container = document.querySelector('#coap-byte-code');
const coap_message = new CoAP_Message(create_container);//, {code_container_type: 'select'});

create_container.addEventListener('coap-change', ev => {
    let s_data = ev.detail;
    let parse = s_data.conn_type == 'unreliable' ? 
                                coap.message.parse(s_data.data) : 
                                coap.message.parse_reliable(s_data.data, s_data.setted_length);
    
    coap_byte_code(byte_code_container, s_data, parse);
    if(parse.has_error) return;
    
    coap_message_display(parsed_container, parse);
});




