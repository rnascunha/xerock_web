import {Event_Emitter} from '../libs/event_emitter.js';
import {App_Events} from './types.js';
import {Configure} from './configure/configure.js';
import {Configure_Events} from './configure/types.js';
import {Register_ID_Events} from './id/types.js';
import {Data_Events} from './data/types.js';
import {Filter_Events} from './libs/filter/types.js';
import {Input_Events} from './input/types.js';
import {About} from './about.js';

import {Profile_Rules} from './configure/profile/model.js';

export class App_Dispatcher extends Event_Emitter
{
    constructor(model, view, opt = {})
    {
        super();
        this._model = model;
        this._view = view;
                
        this._options = opt;
        
        this._context_menu = opt.context_menu;
        
        About(opt.about);
                
        view.on(App_Events.CONNECT_REQUEST, args => this.connect(args));
    }
    
    init()
    {   
        let opt = this._options;
        
        this._model.init(opt);
        
        this._configure = new Configure({
            button: opt.configure,
            profile: opt.profile
        });
        
        this._model.on(App_Events.CLOSE_SERVER, arg => this.emit(App_Events.CLOSE_SERVER, arg))
                    .on(App_Events.SERVER_CONNECTED, server => this.emit(App_Events.SERVER_CONNECTED, server))
                    .on(Register_ID_Events.UPDATE_IDS, apps_ids => this.emit(Register_ID_Events.UPDATE_IDS, apps_ids))
                    .on(Register_ID_Events.CHECK_IDS, arg => this.emit(Register_ID_Events.CHECK_IDS, arg))
                    .on(App_Events.RECEIVED_MESSAGE, message => this.emit(App_Events.RECEIVED_MESSAGE, message))
                    .on(Data_Events.POST, data => this.emit(Data_Events.POST, data))
                    .on(Data_Events.CLEAR, id => this.emit(Data_Events.CLEAR, id))
                    .on(Data_Events.SELECT, selected => this.emit(Data_Events.SELECT, selected))
                    .on(Data_Events.CHANGE_STATE, state => this.emit(Data_Events.CHANGE_STATE, state))
                    .on(Data_Events.CUSTOM_PAINT, config => this.emit(Data_Events.CUSTOM_PAINT, config))
                    .on(Filter_Events.RENDER_DATA, filter => this.emit(Filter_Events.RENDER_DATA, filter))
                    .on(Filter_Events.RENDER_FILTER, filter_opts => this.emit(Filter_Events.RENDER_FILTER, filter_opts))
                    .on(Input_Events.CHANGE_STATE, state => this.emit(Input_Events.CHANGE_STATE, state))
                    .on(Input_Events.COMMAND_LIST, list => this.emit(Input_Events.COMMAND_LIST, list));
        
        this._configure.on(Configure_Events.UPDATE_TYPES, state => this.data.update_time(state.time));
    }
        
    connect(args)
    {
        this._model.open(args.addr, args.port, args.proto, args.opt);
    }
        
    register_app(name, app, opt = {})
    {
        this._model.register_app(name, app, opt);
    }
    
    register_local_app(app, opt = {})
    {
        this._model.register_local_app(app, opt);
    }
    
    register_command(comm)
    {
        this._model.register_command(comm);
    }
    
    register_script(script)
    {
        this._model.register_script(script);
    }
    
    register_view(name, view)
    {
        return this.data.register_view(name, view);
    }
                
    configure()
    {
        return this._configure;
    }
    
    load_profile(data, rules = null)
    {
        if(rules === null || rules[Profile_Rules.types.value])
            this.configure().types.state(data.configure.types);
        
        if(rules === null || rules[Profile_Rules.storage.value])
            this.configure().config_storage(data.configure.storage);
        
        if(rules === null || rules[Profile_Rules.data.value])
            this.data.view_state(data.data.state);
        
        if(rules === null || rules[Profile_Rules.select.value])
            this.data.select.select(data.data.select, false);
        
        if(rules === null || rules[Profile_Rules.filter.value])
            this.data.filter.update(data.data.filter);
        
        if(rules === null || rules[Profile_Rules.custom_paint.value])
            this.data.config_custom_paint(data.data.custom_paint, false);
        
        if(rules === null || rules[Profile_Rules.input.value])
            this.input.view_state(data.input.state);
        
        if(rules === null || rules[Profile_Rules.commands.value])
            this.input.history.list(data.input.commands_history);
    }
    
    add_connection(id, addr, options = {}, connect = false)
    {
        this._model.add_connection(id, addr, options, connect);
    }
        
    is_connected(conn)
    {
        return this._model.is_connected(conn);
    }
    
    
    
    get servers(){ return this._model.servers; }
    get data(){ return this._model.data; }
    get input(){ return this._model.input; }
    get context_menu(){ return this._context_menu; }
}
