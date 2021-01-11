import {Script_Template} from '../../core/script_executor/script_template.js';
import {Script_Events, Script_Errors} from '../../core/script_executor/types.js';
import {Message_Type, Message_Direction, get_message_data} from '../../core/libs/message_factory.js';
import {Register_ID} from '../../core/id/controller.js';
import {App_List} from '../../apps/app_list.js';

import style from './libs/script_config.css';

export class Echo_Script extends Script_Template{
    constructor(name)
    {
        super(name);

        this._compare_el = null;
        this._el = this._create_element();
        this._input_id = new Register_ID(this._el.querySelector('#app-id'), {exclude_app: App_List.ECHO.name});
        
        this._id = null;
        
        this.on(Script_Events.CHECK_IDS, list => this._input_id.check_ids(list));
        this.on(Script_Events.RECEIVED_MESSAGE, message => this._on_message(message));
    }
        
    element(){
        return this._el;
    }
    
    enable(en)
    {
        this._el.querySelector('#app-id').disabled = Boolean(en);
        this._compare_el.disabled = Boolean(en);
    }
    
    run()
    {
        this._id = this._input_id.selected();
        if(!this._id)
        {
            this.cancel(Script_Errors.NO_INPUT);
            return false;
        }    
        this.monitor_ids(this._id);
    
        return this._run_script();
    }
    
    _create_element()
    {
        let el = document.createElement('div');
        el.innerHTML = `<style>${style.toString()}</style>
                        <label for=app-id class=script-label>ID:</label>
                        <select id=app-id class=script-input-id-select></select><br>
                        <input type=checkbox id=compare-type checked>
                        <label for=compare-type class=script-label>ID match exactly`;
        
        this._compare_el = el.querySelector('#compare-type');
        
        return el;
    }
    
    _on_message(message)
    {
        if(this._id.filter_message(message, this._compare_el.checked, {"dir": [Message_Direction.received.value], 
                                                                       "type": [Message_Type.data.value]}))
            this._id.send(get_message_data(message), message.from);
    }
    
    async _run_script(){
        await this.script_busy_loop();

        return this.reason() == Script_Errors.BUTTON_CANCEL ? true : false;
    }
}
