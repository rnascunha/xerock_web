import {Event_Emitter} from '../libs/event_emitter.js';
import {Server} from './server/controller.js';
import {Server_Events} from './server/types.js';
import {App_Daemon_Template, App_Local_Template} from './app/app_template.js';
import {My_Websocket, Websocket_Events} from './websocket.js';
import {App_Events, Custom_Paint_Type, default_options} from './types.js';
import {App_ID_Template} from './id/id_template.js';
import {Register_ID_Events} from './id/types.js';
import {Input_Events} from './input/types.js';
import {Main_App} from '../apps/main/main_app.js';
import {App_List} from '../apps/app_list.js';
import {make_all_app_default_custom_paint} from './functions.js';
import {Data_Events} from './data/types.js';
import {Filter_Events} from './libs/filter/types.js';

import {Script_Executor} from './script_executor/controller.js';
import {Script_Template} from './script_executor/script_template.js';

import {Local_Server} from './server/local_server.js';

let server_id = 0;

export class App_Dispatcher_Model extends Event_Emitter
{
    constructor(input_data, ids_manager, output_data, options = {})
    {
        super();    
        
        this._app_list = [];
        this._local_app_list = [];
        this._server_list = {};
        this._connecting_list = {};
        
        this._options = {...default_options, ...options};
        
        this._data = output_data;
        
        this._input = input_data;
        this._input.on(Input_Events.SEND_INPUT, this.send_input.bind(this))
                    .on(Input_Events.CHANGE_STATE, state => this.emit(Input_Events.CHANGE_STATE, state))
                    .on(Input_Events.COMMAND_LIST, list => this.emit(Input_Events.COMMAND_LIST, list));

        this._ids_manager = ids_manager;
        this._ids_manager.on(Register_ID_Events.CHECK_IDS, args => {
            this.emit(Register_ID_Events.CHECK_IDS, args);
            this._data.emit(Register_ID_Events.CHECK_IDS, args);
            this._script.emit(Register_ID_Events.CHECK_IDS, args);
            this._input.enable(this._ids_manager.has_ids() ? true : false);
        });
        
        this._script = null;
        this._configure = null;
        this._local_server = null;
                
        this._data.on(Register_ID_Events.PROPAGATE, reg_ids => this._ids_manager.propagate(reg_ids));
    }
    
    init(opt = {})
    {   
        this.register_app(App_List.MAIN.name, Main_App, App_List.MAIN.options);
        
        this._configure = opt.configure_instance;
        this._input.set_configure(this._configure);
        
        if('script' in opt)
            this._script = new Script_Executor(opt.script);
        
        this._data.on(Data_Events.POST, data => this.emit(Data_Events.POST, data))
                    .on(Data_Events.CLEAR, id => this.emit(Data_Events.CLEAR, id))
                    .on(Filter_Events.RENDER_DATA, filter => this.emit(Filter_Events.RENDER_DATA, filter))
                    .on(Filter_Events.RENDER_FILTER, filter_opts => this.emit(Filter_Events.RENDER_FILTER, filter_opts))
                    .on(Data_Events.SELECT, selected => this.emit(Data_Events.SELECT, selected))
                    .on(Data_Events.CHANGE_STATE, state => this.emit(Data_Events.CHANGE_STATE, state))
                    .on(Data_Events.CUSTOM_PAINT, config => this.emit(Data_Events.CUSTOM_PAINT, config));
        
        this._local_server = new Local_Server();
        this._local_server.on(Server_Events.SAVE_CONNECTION, args => this.emit(Server_Events.SAVE_CONNECTION, args));
//        setTimeout(() => this._local_server.init(), 1000);
    }
    
    get data(){ return this._data; }
    get servers(){ return this._server_list; }
    get input(){ return this._input; }
            
    register_command(comm)
    {
        this._input.register(comm);
    }
        
    send_input(message)
    {
        let selected = this._ids_manager.selected();
        if(!selected)
        {
            console.error('No ID selected');
            return;
        }
        
        selected.app().send(message.input, selected, undefined, {data_type: message.type});
    }
            
    _check_connected(addr, port, protocol, list)
    {
        return `${protocol}://${addr}:${port}` in list;
    }
    
    open(addr, port, protocol, opt)
    {
        if(this._check_connected(addr, port, protocol, this._server_list))
        {
            this.emit(Websocket_Events.CONNECT_ARGS_ERROR, {reason: 'Already connected'});
            return;
        }
        
        if(this._check_connected(addr, port, protocol, this._connecting_list))
        {
            this.emit(Websocket_Events.CONNECT_ARGS_ERROR, {reason: 'Already trying to connect'});
            return;
        }
            
        let ws = new My_Websocket();
        ws.on(Websocket_Events.CONNECT_ARGS_ERROR, args => this.emit(Websocket_Events.CONNECT_ARGS_ERROR, args))
            .on(Websocket_Events.CONNECTED, event => this.connected(ws, event))
            .on(Websocket_Events.CONNECTING, socket => { 
                this._connecting_list[socket.addr()] = socket; 
            })
            .on(Websocket_Events.CLOSE, arg => {
                delete this._connecting_list[arg.addr];
                /*
                * This line is redundant with close_server method.
                */
                delete this._server_list[arg.addr];
                this.emit(App_Events.CLOSE_SERVER, arg)
        })
        .on(Websocket_Events.ERROR, error => this.emit(Websocket_Events.ERROR, error));

        ws.open(addr, port, protocol, opt);
    }
        
    connected(ws, event)
    {
        //Remove from connecting list
        delete this._connecting_list[ws.addr()];
        
        let id = this.get_server_id(ws.addr());
        let server = new Server(id, ws, this._app_list);
        
        server.on(Server_Events.REGISTER_INPUTS, inputs => this.register_input(inputs))
            .on(Server_Events.CLOSE, arg => this.close_server(arg))
            .on(Server_Events.POST_MESSAGE, msg => this.post_message(msg))
            .on(Server_Events.RECEIVED_MESSAGE, msg => this.emit(App_Events.RECEIVED_MESSAGE, msg))
            .on(Server_Events.SERVER_NAME_CHANGE, args => this.data.update_server_name(args.id, args.name))
            .on(Server_Events.SAVE_CONNECTION, args => this.emit(Server_Events.SAVE_CONNECTION, args));
        
        this._server_list[server.addr()] = server;        
        
        this.emit(App_Events.SERVER_CONNECTED, server);
        this.add_connection(id, ws.addr(), ws.options(), false);
    }
    
    close_server(server)
    {
        delete this._server_list[server.addr()];
        this._ids_manager.clean(server);
    }
    
    get_server_id(addr)
    {
        if(addr in this._configure.connections)
            return this._configure.connections[addr].id;
        return ++server_id;
    }
    
    add_connection(id, addr, options = {}, connect = false)
    {
        if(id === this._local_server.id())
        {
            this._local_server.load_connection(id, addr, options);
            return;
        }
        
        server_id = id > server_id ? id : server_id;
        if(connect)
        {
            let value = addr.split(/:\/\/|:/);
            this.open(value[1], value[2], value[0], options);
        }
        
        this.emit(App_Events.ADD_CONNECTION, {addr: addr, options: options});
    }
                
    register_input(apps_ids)
    {
        this._ids_manager.push_ids(apps_ids);
    }
    
    register_script(script)
    {
        console.assert(script instanceof Script_Template, 'Arg "script" must be of type Script_Template');
        console.assert(this._script !== null, '"Script_Executor" was not initialized');

        this._script.register(script);
    }
    
    register_app(name, app, opt = {})
    {    
        app.app_name = name;
        this._check_app_options(name, opt);
        
        this._app_list.push({app: app, opt: opt});
        this._emit_all_server_events(App_Events.ADD_APP, {app: app, opt: opt});
    }
        
    register_local_app(app, opt = {})
    {        
        if(app.support())
        {
            let local_app = new app(this._local_server, opt);
            this._check_app_options(local_app.name(), opt);
            
            this._local_app_list.push(local_app);
            local_app.on(App_Events.INPUT_REGISTER, inputs => this.register_input(inputs))
                .on(App_Events.SEND_MESSAGE, msg => this.post_message(msg))
                .on(App_Events.RECEIVED_MESSAGE, msg => {
                        Promise.resolve().then(() => {
                            this.post_message(msg);
                            this.emit(App_Events.RECEIVED_MESSAGE, msg);
                        });
            })
            this.emit(App_Events.ADD_LOCAL_APP, {app: local_app, opt: opt});
        } else
            console.warn(`This browser doesn\'t support the ${app.name} app.`)
    }
    
    _check_app_options(app_name, opt)
    {
        if(this._options.app_custom_paint && 'color' in opt)
            make_all_app_default_custom_paint(app_name, opt.color, opt.paint_types,
                                                 (style, filter) => this._data.add_custom_paint(style, filter));
    }
    
    _emit_all_server_events(event, arg)
    {
        Object.values(this._server_list).forEach(server => server.emit(event, arg));
    }
    
    /*
    *   Data
    */
    prepend_message(message, id = null){ this._data.prepend(message, id); }
    post_message(message)
    { 
        this._script.emit(App_Events.RECEIVED_MESSAGE, message);
        this._data.post(message); 
    }
    clear_filter(filter, clear_storage = false){ this._data.clear_filter(filter, clear_storage); }
    clear(clear_storage = false){ this._data.clear(clear_storage); }
}