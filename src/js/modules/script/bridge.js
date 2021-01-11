import {Script_Template} from '../../core/script_executor/script_template.js';
import {Script_Events, Script_Errors} from '../../core/script_executor/types.js';
import {Message_Type, Message_Direction, get_message_data} from '../../core/libs/message_factory.js';
import {Message_Info} from '../../core/types.js';
import {Register_ID} from '../../core/id/controller.js';

import style from './libs/script_config.css';

export class Bridge_Script extends Script_Template
{
    constructor(name)
    {
        super(name);

        this._el = this._create_element();
        
        this._input_id1 = new Register_ID(this._el.querySelector('#app-id1'));
        this._input_id2 = new Register_ID(this._el.querySelector('#app-id2'));
        
        this._id1 = null;
        this._id2 = null;
                
        this.on(Script_Events.CHECK_IDS, list => {
            this._input_id1.check_ids(list);
            this._input_id2.check_ids(list);
        });
        
        this.on(Script_Events.RECEIVED_MESSAGE, message => this._on_message(message));
        
        this._compare_exactly = this._el.querySelector('#compare-type');
    }
        
    element()
    {
        return this._el;
    }
    
    enable(en)
    {
        this._el.querySelector('#app-id1').disabled = Boolean(en);
        this._el.querySelector('#app-id2').disabled = Boolean(en);
        this._el.querySelector('#compare-type').disabled = Boolean(en);
    }
    
    run(){
        //Input1
        this._id1 = this._input_id1.selected();
        if(!this._id1)
        {
            this.cancel(Script_Errors.NO_INPUT);
            return false;
        }
                
        //Input2
        this._id2 = this._input_id2.selected();
        if(!this._id2)
        {
            this.cancel(Script_Errors.NO_INPUT);
            return false;
        }
        
        if(this._id1.is_equal(this._id2)){
            this.cancel('same input');
            return false;
        }
        
        this.monitor_ids([this._id1, this._id2]);
        
        return this._run_script();
    }
    
    _create_element()
    {
        let el = document.createElement('div');
        el.innerHTML = `<style>${style.toString()}</style>
                        <label for=app-id1 class=script-label>ID1:</label>
                        <select id=app-id1 class=script-input-id-select></select><br>
                        <label for=app-id2 class=script-label>ID2:</label>
                        <select id=app-id2 class=script-input-id-select></select><br>
                        <input type=checkbox id=compare-type checked>
                        <label for=compare-type class=script-label>ID match exactly`;
                
        return el;
    }
    
    _on_message(message)
    {
        if(this._id1.filter_message(message, this._compare_exactly.checked, {"dir": [Message_Direction.received.value], 
                                                                            "type": [Message_Type.data.value]}))
            this._id2.send(get_message_data(message), message.from);
        
        if(this._id2.filter_message(message, this._compare_exactly.checked, {"dir": [Message_Direction.received.value], 
                                                                            "type": [Message_Type.data.value]}))
            this._id1.send(get_message_data(message), message.from);
    }
    
    async _run_script(){
        await this.script_busy_loop();

        return this.reason() == Script_Errors.BUTTON_CANCEL ? true : false;
    }
}
