import {Event_Emitter} from '../../libs/event_emitter.js';
import {serial_html_template, Serial_Baudrate, Serial_Parity, Serial_Bytesize, 
        Serial_Stopbit, Serial_Flow_Control, register_types,
       serial_fc_start, serial_fc_stop, Serial_Events} from './define.js';
import {number_to_string_hex} from '../../helper/helper_types.js';
import {get_selected} from '../../helper/helpers_basic.js';

import style from './serial.css';

export class Serial_App_View extends Event_Emitter{
    constructor(model){
        super();
        
        this._model = model;
        
        this._raw_container = null;
        this._container = null;

        model.on(Serial_Events.STATUS, ports => this.update(ports))
            .on(Serial_Events.ERROR, error => this.error(error));        
    }
    
    error(err)
    {
        this._error.value = err;
    }
    
    render(container)
    {
        this._container = container;
        
        const style_el = document.createElement('style');
        style_el.innerHTML = style.toString();
        
        this._container.appendChild(style_el);
        this._container.appendChild(serial_html_template.content.cloneNode(true));
        
        this._error = this._container.querySelector('#error');
        
        this._el_tbody = this._container.querySelector('#tbody-ports');

        this._el_baudrate = this._container.querySelector("#baudrate");
        register_types(this._container.querySelector("#baudrates"), Serial_Baudrate);
        
        this._el_char_size = this._container.querySelector("#bytesize");
        register_types(this._el_char_size, Serial_Bytesize);
        
        this._el_parity = this._container.querySelector("#parity");
        register_types(this._el_parity, Serial_Parity);
        
        this._el_stopbit = this._container.querySelector("#stopbit");
        register_types(this._el_stopbit, Serial_Stopbit);
        
        this._el_flow_control = this._container.querySelector("#flowcontrol");
        register_types(this._el_flow_control, Serial_Flow_Control);
        
        /**
        * Hardware/Software flowcontrol and start/stop bytes of software serial 
        * configuration not yet implemented
        */
        this._el_fc_start = this._container.querySelector("#flowcontrol-start");
        this._el_fc_start.value = number_to_string_hex(serial_fc_start, true);
        this._el_fc_stop = this._container.querySelector("#flowcontrol-stop");
        this._el_fc_stop.value = number_to_string_hex(serial_fc_stop, true);
        
//        this._el_flow_control.addEventListener('click', event => {
//            let opt = get_selected(this._el_flow_control).value;
//
//            this._container.querySelectorAll(".flowcontrol-args").forEach(sel => 
//                sel.style.display = opt == "sw" || opt == "hw_sw" ? 'flex' : 'none');
//                                                                          
//        });
//        this._el_flow_control.dispatchEvent(new Event('click'));
        this._container.querySelectorAll(".flowcontrol-args")
            .forEach(sel => 
                sel.style.display = 'none');
        
        this._container.querySelector("#update-button")
            .addEventListener('click', event => {
            this.emit(Serial_Events.STATUS);
        });
    }
    
    update(ports)
    {
        let list = this._model.list();
        if(list.length == 0){
            this._el_tbody.innerHTML = "<tr><td colspan=2 style='text-align: center'>No read</td></tr>";
            return;
        }

        this._el_tbody.innerHTML = "";
        list.forEach((p, i) => {
            let line = document.createElement('tr');
            line.setAttribute('class', 'table-port-line');

            let name_serial = document.createElement('td');
            name_serial.classList.add('table-port-name');
            name_serial.textContent = p.is_open() ? `${p.name()} (${p.short_notation(false)})` : p.name();
            name_serial.title = p.is_open() ? `${p.name()}(${p.short_notation(true)})` : p.name();
            
            line.appendChild(name_serial);
            line.innerHTML += `<td class=conn-button data-value=${p.is_open()}>${p.is_open() ? "&times;" : "&#9658;"}</td>`;
            
            this._el_tbody.appendChild(line);

            line.querySelector(".conn-button").addEventListener('click',(event) => {
                if(event.target.dataset.value == "false")
                {
                    let baudrate = +this._el_baudrate.value;
                    if(!(typeof baudrate == 'number' && baudrate > 0))
                    {
                        this.error(`Baudrate must be a postive number [${baudrate}]`);
                        return;
                    }
                    
                    let config = {
                        port: p.name(),
                        baudrate: baudrate,
                        char_size: parseInt(get_selected(this._el_char_size).value),
                        parity: parseInt(get_selected(this._el_parity).value),
                        stopbit: parseInt(get_selected(this._el_stopbit).value),
                        flow_control: parseInt(get_selected(this._el_flow_control).value),
                        fc_start: parseInt(this._el_fc_start.value),
                        fc_stop: parseInt(this._el_fc_stop.value)
                    }
                    this.emit(Serial_Events.OPEN, config);
                } else {
                    this.emit(Serial_Events.CLOSE, p.name())
                }
            });
        });
    }
}
