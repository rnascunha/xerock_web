import {Event_Emitter} from '../../libs/event_emitter.js';
import {Script_Template} from './script_template.js';
import {Script} from './script.js';
import {Script_Events} from './types.js';

export class Script_Executor_Model extends Event_Emitter
{
    constructor()
    {
        super();
        
        this._script_list = [];
        
        this.on(Script_Events.CHECK_IDS, list => {
            this._script_list.forEach(script => script.emit(Script_Events.CHECK_IDS, list));
        })
        .on(Script_Events.RECEIVED_MESSAGE, message => {
            this._script_list.forEach(script => script.emit(Script_Events.RECEIVED_MESSAGE, message));
        });
    }
    
    register(script)
    {
        console.assert(script instanceof Script_Template, 'Arg "script" must be of type "Script_Template"')
        
        let new_script = new Script(script);        
        this._script_list.push(new_script);
        
        this.emit('add_script', new_script);
    }
        
    cancel_scripts(reason = '')
    {
        this._script_list.forEach(script => {
            if(script.is_running()) script.cancel(reason);
        });
    }
}