/*
* TODO: Criar filtro por usuário, numero de mensagem, time...
*/
import {Event_Emitter} from '../../../libs/event_emitter.js';
import {Filter_Model} from './model.js';
import {Filter_View} from './view.js';
import {Filter_Events} from './types.js';

export class Filter extends Event_Emitter{
    constructor(model, view)
    {
        super();
        this._model = model;
        this._view = view;
        
        this._view.on(Filter_Events.SET_FILTER, arg => this.select(arg, arg.recursevely, arg.unselect));
                
        this._model.on(Filter_Events.RENDER_DATA, filter => this.emit(Filter_Events.RENDER_DATA, filter))
                    .on(Filter_Events.RENDER_FILTER, options => this.emit(Filter_Events.RENDER_FILTER, options));
    }
    
    add_option(msg){ this._model.add_option(msg); }
    select(filter, recursvely = false, unselect = false, emit = true){ this._model.select(filter, recursvely, unselect, emit); }
    
    filter(data){ return this._model.filter(data); }
    filter_options(options = null, copy = false){ return this._model.filter_options(options, copy); }
    
    get(){ return this._model.get(); }
    update(filter){ this._model.update(filter); }
        
    static filter(filter, data)
    {
        return Filter_Model.filter(filter, data);
    }
}
