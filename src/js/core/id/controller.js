import {Event_Emitter} from '../../libs/event_emitter.js';
import {Register_ID_Model} from './model.js';
import {Register_ID_View} from './view.js';
import {Register_ID_Events} from './types.js';

export class Register_ID extends Event_Emitter
{
    constructor(container, options = {})
    {
        super();
        this._model = new Register_ID_Model(options);
        this._view = new Register_ID_View(this._model, container);
        
        this._model.on(Register_ID_Events.CHECK_IDS, list => this.emit(Register_ID_Events.CHECK_IDS, list));        
        this._view.on(Register_ID_Events.CHANGE_ID, sel => this._model.check_selected(sel));
        
        this.check_ids();
    }
        
    push_ids(ids, render = true)
    { 
        this._model.push_ids(ids, render);
    }
    
    check_ids(list = {}){ this._model.check_ids(list); }
    
    has_ids(){ return this._model.has_ids(); }
    list(){ return this._model.list(); }
    flat_list() { return this._model.flat_list(); }
    clean(arg)
    { 
        this._model.clean(arg); 
    }
    selected(select = null){ return this._model.selected(select); }
    
    propagate(ids = null)
    { 
        this._model.propagate(ids)
    }
}