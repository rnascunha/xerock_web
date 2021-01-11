import {Event_Emitter} from '../../libs/event_emitter.js';
import {Script_Executor_Model} from './model.js';
import {Script_Executor_View} from './view.js';
import {App_Events} from '../types.js';
import {Register_ID_Events} from '../id/types.js';
import {Script_Events} from './types.js';

export class Script_Executor extends Event_Emitter
{
    constructor(container)
    {
        super();
        
        this._model = new Script_Executor_Model();
        this._view = new Script_Executor_View(this._model, container);
        
        this._view.render();
        
        this.on(Register_ID_Events.CHECK_IDS, list => this._model.emit(Script_Events.CHECK_IDS, list))
            .on(App_Events.RECEIVED_MESSAGE, message => this._model.emit(Script_Events.RECEIVED_MESSAGE, message));
    }
        
    register(script){ this._model.register(script); }
    cancel_scripts(arg){ this._model.cancel_scripts(arg); }
}