import {Command_Template} from '../../core/input/commands/commands.js';
import {Input_Events, Input_Type} from '../../core/input/types.js';

export class Input_ESP32_BR extends Command_Template{
    constructor()
    {
        super('ESP32 BR');
    }
    
    render()
    {    
        let el = document.createElement('esp32-br-input');
        el.addEventListener('send_click', event => {
            if(event.detail > 1) return;
            this.emit(Input_Events.SET_INPUT, {data: event.target.value_str, type: Input_Type.hex.value});
        });
        el.addEventListener('send_dbl_click', event => {
            this.emit(Input_Events.SEND_INPUT, {data: event.target.value_str, type: Input_Type.hex.value});
        });
                
        return el;
    }
}