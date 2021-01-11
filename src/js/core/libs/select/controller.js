import {Event_Emitter} from '../../../libs/event_emitter.js';
import {Select_Model} from './model.js';
import {Select_View} from './view.js';
import {columns_default} from './types.js';

import {Select_Events} from './types.js';

export class Select extends Event_Emitter
{
    constructor(model, view)
    {
        super();
        
        this._model = model;
        this._view = view;
        
        this._model.on(Select_Events.RENDER_DATA, arg => this.emit(Select_Events.RENDER_DATA, arg));
        this._view.on(Select_Events.SET_SELECTED, arg => this._model.set_select(arg.type, arg.column));
                        
        this._view.render();
    }
    
    is_selected(col){ return this._model.is_selected(col); }
    select(selected = null, emit = true){ return this._model.select(selected); }
    columns(){ return this._model.columns(); }
    
    add(column){ this._model.add(column); }
    remove(column){ this._model.remove(column); }
    
    static is_selected(cols, col){
        return Select_Model.is_selected(cols, col);
    }       
}
