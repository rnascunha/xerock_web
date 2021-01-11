import {Event_Emitter} from '../../../libs/event_emitter.js';
import {View_Events} from './types.js';
import {Register_ID_Events} from '../../id/types.js';
import {Data_Events} from '../types.js';
import {App_Events} from '../../types.js';

export class View extends Event_Emitter
{
    constructor(model, view)
    {
        super();
        
        this._model = model;
        this._view = view;
        
        this._view.on(View_Events.OPEN_VIEW, view_name => this.open(view_name))
                    .on(View_Events.REMOVE_VIEW, view => this.remove(view));
        
        this._model.on(Register_ID_Events.PROPAGATE, reg_ids => this.emit(Register_ID_Events.PROPAGATE, reg_ids))
                    .on(View_Events.SELECT_ID, args => this.emit(View_Events.SELECT_ID, args));
        
        this.on(Register_ID_Events.CHECK_IDS, list => this._model.emit(Register_ID_Events.CHECK_IDS, list))
            .on(Data_Events.POST, data => this._model.emit(App_Events.RECEIVED_MESSAGE, data));
            
    }

    register(name, view, options = {}){ this._model.register(name, view, options); }
    open(view_name){ return this._model.open(view_name); }
    remove(view){ this._model.remove(view); }
}