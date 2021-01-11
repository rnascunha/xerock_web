import {Event_Emitter} from '../../libs/event_emitter.js';
import {Input_Events} from './types.js';

export class Input extends Event_Emitter
{
    constructor(model, view)
    {
        super();
        
        this._model = model;
        this._view = view;
        
        this._model.on(Input_Events.SEND_INPUT, args => this.emit(Input_Events.SEND_INPUT, args))
                    .on(Input_Events.CHANGE_TYPE, state => this.emit(Input_Events.CHANGE_STATE, state))
                    .on(Input_Events.COMMAND_LIST, list => this.emit(Input_Events.COMMAND_LIST, list));
        
        this._view.on(Input_Events.CHANGE_STATE, state => this.emit(Input_Events.CHANGE_STATE, state));
    }
    
    init(history_comm, comm){ this._model.init(history_comm, comm); }
    enable(en){ this._model.enable(en); }
    register(comm){ this._model.register(comm); }
    set_input(data, type){ this._model.set_input(data, type); }
    send_input(){ this._model.send_input(data, type); }
    
    get history(){ return this._model.history; }
    
    view_state(state = null){ return this._view.state(state); }
}