import {Script_Template} from '../../core/script_executor/script_template.js';
import {Script_Events, Script_Errors} from '../../core/script_executor/types.js';
import {Input_Type} from '../../core/input/types.js';
import {Register_ID} from '../../core/id/controller.js';

import style from './libs/script_config.css';

const send_message_num_default = 5;

export class Send_Message_Script extends Script_Template
{
    constructor(name)
    {
        super(name);
        
        this._el = this._create_element();
        this._id_input = new Register_ID(this._el.querySelector('#select-app-id'));
        
        this._test_num = 0;
        
        this.on(Script_Events.CHECK_IDS, list => this._id_input.check_ids(list));
    } 
        
    element(){ return this._el; }
    
    enable(en)
    {
        this._el.querySelector('#select-app-id').disabled = Boolean(en);
        this._el.querySelector('#num-msg').disabled = Boolean(en);
        this._el.querySelector('#msg').disabled = Boolean(en);
        this._el.querySelector('#inteval').disabled = Boolean(en);
    }
    
    run()
    {
        let input = this._id_input.selected();
        if(!input){
            this.cancel(Script_Errors.NO_INPUT);
            return false;
        }
        
        let num_msg = this._el.querySelector('#num-msg').value;
        let msg = `[${this._test_num++}] ${this._el.querySelector('#msg').value}`;
        let interval = this._el.querySelector('#inteval').value;

        this.monitor_ids(input);

        return this._run_script(input, num_msg, interval, msg);
    }
        
    _create_element(apps_ids)
    {
        let el = document.createElement('div');
        el.innerHTML = `<style>${style.toString()}</style>
                        <label for=select-app-id class=script-label>ID:</label>
                        <select id=select-app-id class=script-input-id-select></select><br>
                    <label for=num-msg class=script-label>N. msgs:</label>
                    <input type=number id=num-msg min=1 value=${send_message_num_default} style="width:7ch"><br>
                    <label for=msg class=script-label>Data:</label>
                    <input id=msg value="message data " style='width:150px;'><br>
                    <label for=inteval class=script-label>Interval(ms):</label>
                    <input type=number id=inteval style="width:7ch" min=500 value=1000>`;
        
        return el;
    }
    
    async _run_script(id, num, interval, msg)
    {
        for(let i = 0; i < num; i++)
        {
            await this.delay(interval);
            if(this.is_cancelled()) return false;
            id.send(msg + i, undefined, {data_type: Input_Type.text.value});
        }
        return true;
    }
}
