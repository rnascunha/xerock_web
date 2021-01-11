import {Event_Emitter} from '../../libs/event_emitter.js';
import {Data_Model} from './model.js';
import {Data_View} from './view.js';
import {Data_Events} from './types.js';
import {Filter_Events} from '../libs/filter/types.js';
import {Register_ID_Events} from '../id/types.js';

export class Data extends Event_Emitter
{
    constructor(model, view)
    {
        super();
        
        this._model = model;
        this._view = view;
        
        this._model.on(Data_Events.POST, data => this.emit(Data_Events.POST, data))
                    .on(Data_Events.CLEAR, id => this.emit(Data_Events.CLEAR, id))
                    .on(Filter_Events.RENDER_DATA, filter => this.emit(Filter_Events.RENDER_DATA, filter))
                    .on(Filter_Events.RENDER_FILTER, filter_opts => this.emit(Filter_Events.RENDER_FILTER, filter_opts))
                    .on(Data_Events.SELECT, selected => this.emit(Data_Events.SELECT, selected))
                    .on(Register_ID_Events.PROPAGATE, reg_ids => this.emit(Register_ID_Events.PROPAGATE, reg_ids));
        
        this._view.on(Data_Events.RENDER, containers => this._model.init(containers))
                    .on(Data_Events.CLEAR, () => this.clear())
                    .on(Data_Events.DELETE, data => this.remove(data))
                    .on(Data_Events.CHANGE_STATE, state => this.emit(Data_Events.CHANGE_STATE, state))
                    .on(Data_Events.CUSTOM_PAINT, config => this.emit(Data_Events.CUSTOM_PAINT, config))
                    .on(Data_Events.MESSAGE_SELECT, line => this.message_select(line));

        //Emitting events > data > Views
        this.on(Register_ID_Events.CHECK_IDS, args => this._model.emit(Register_ID_Events.CHECK_IDS, args))
        this._view.init();
    }
    
    clear(clear_storage = false){ this._model.clear(clear_storage); }
    clear_filter(filter, clear_storage = false){ this._model.clear_filter(filter, clear_storage); }
    prepend(data, id = null){ this._model.prepend(data, id); }
    post(data){ this._model.post(data); }
    remove(data){ this._model.remove(data); }
    update_server_name(id, new_name){ this._model.update_server_name(id, new_name); }
    message_select(line){ this._model.message_select(line); }
    register_view(name, view, options = {}){ this._model.register_view(name, view, options); }
    
    get select(){ return this._model.select; }
    get filter(){ return this._model.filter; }
    
    update_time(time){ this._view.update_time(time); }
    add_custom_paint(css, filter){ this._view.add_custom_paint(css, filter); }
    config_custom_paint(data = null, save = true){ return this._view.config_custom_paint(data, save); }
    view_state(state = null){ return this._view.state(state); };
}
