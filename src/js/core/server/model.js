import {Event_Emitter} from '../../libs/event_emitter.js';
import {Websocket_Events} from '../websocket.js';
import {Server_Events} from './types.js';
import {App_Events} from '../types.js';
import {Message_Direction} from '../libs/message_factory.js';
import {App_List} from '../../apps/app_list.js';

export class Server_Model extends Event_Emitter
{
    constructor(id, websocket, app_list = [])
    {
        super();
        
        this._id = id;
        this._ws = websocket;
        
        this._app_list = {};
        app_list.forEach(app => this.register_app(app.app, app.opt, app.app.app_name === App_List.MAIN.name ? true : false));
        
        this._session = 'session' in this._ws.options() ? ++this._ws.options().session : 0;
        
        this._name = '';
        this.name(this._ws.options().name);
        this.autoconnect(this._ws.options().autoconnect);
        
        this._num_users = -1;
        this._uid = -1;
                                
        this._ws.on(Websocket_Events.RECEIVED_MESSAGE, message => this._deliver_message(message))
            .on(Websocket_Events.ERROR, arg => this.error(arg))
            .on(Websocket_Events.CLOSE, arg => this._closed());
        
        this.on(Server_Events.CONFIG_MESSAGE, apps => {
            apps.forEach(app => this._check_app_config(app));
        });
    }
        
    id(){ return this._id; }
    addr(){ return this._ws.addr(); }
    //This function is made so can be overriden at the data viewer.
    full_addr(){ return this.addr(); }
    user_id(){ return this._uid; }
    user_number(){ return this._num_users; }
    get session(){ return this._session; }
    
    add_session()
    { 
        ++this._session; 
        this._save_connection();
        
        this.emit(Server_Events.UPDATE_SESSION, this.session);
        return this._session;
    }
    
    name(name = null)
    { 
        if(name !== null)
        {
            if(name == this.addr())
                this._name = '';
            else this._name = name;
            this.emit(Server_Events.SERVER_NAME_CHANGE, {id: this._id, name: this._name});
            this.emit_all_apps(App_Events.SERVER_NAME_CHANGE, this._name);
            this._save_connection();
        }
        return this._name; 
    }
    
    autoconnect(enable = null)
    {
        if(enable !== null)
        {
            this._autoconnect = Boolean(enable);
            this.emit(Server_Events.SET_AUTOCONNECT, this._autoconnect);
            this._save_connection();
        }
        
        return this._autoconnect;
    }
    
    _save_connection()
    {
        window.app.configure().save_connection(this.id(), this.addr(), {
                                                                    name: this.name(),  
                                                                    autoconnect: this.autoconnect(),
                                                                    session: this.session                                                
                                                                });
    }
    
    _initiate_app(app)
    {
        app.app = new app.class(this, app.opt);
        
        app.app.on(App_Events.SEND_MESSAGE, msg => this.send(msg));
        app.app.on(App_Events.INPUT_REGISTER, args => this.register_input(args));
        app.app.on(App_Events.RECEIVED_MESSAGE, args => this.post_message(Message_Direction.received.value, args));
        
        this.emit(Server_Events.ADD_APP, {app: app.app, opt: app.opt});
                
        if(app.enableable || app.app_name === 'main')
        {
            app.app.enable(true);
            app.enabled = true;
        }                    
    }

    register_app(app, opt, init = true)
    {
        if(!(app.app_name in this._app_list))
            this._app_list[app.app_name] = {class: app, opt: opt, app: null, enabled: false, enableable: false};
        else if(this._app_list[app.app_name].class === null)
        {
            this._app_list[app.app_name].class = app;
            this._app_list[app.app_name].opt = opt;
        }
        
        if(init)
            this._initiate_app(this._app_list[app.app_name]);
    }
    
    error(arg)
    {
        console.log('error', arg);
    }
    
    close(){ this._ws.close(); }
    
    _closed()
    {
        //disable all apps;
        this.emit(Server_Events.CLOSE, this);
    }
    
    emit_all_apps(event, arg)
    {
        Object.values(this._app_list).forEach(app => {
            if(app.app !== null) app.app.emit(event, arg)
        });
    }
    
    send(data)
    {
        data.uid = this._uid;
        this._ws.send(JSON.stringify(data));
    }
    
    register_input(apps_ids)
    {
        this.emit(Server_Events.REGISTER_INPUTS, apps_ids);
    }
        
    _deliver_message(msg)
    {
        Promise.resolve().then(() => {
            let message = JSON.parse(msg);

            if(message.hasOwnProperty('echoed'))
            {
                this.post_message(App_Events.SENT, message);
                return;
            }

            if(message.app in this._app_list && this._app_list[message.app].app != null)
            {
                this._app_list[message.app].app.on_message(message);
                this.emit(Server_Events.RECEIVED_MESSAGE, message);
            } else
                this.emit(Server_Events.APP_NOT_FOUND, message);
        });
    }
    
    post_message(direction, message)
    {
        message.dir = direction == Message_Direction.received.value ? Message_Direction.received.value : Message_Direction.sent.value;
        message.sid = this.id();
        message.saddr = this.addr();
        message.sname = this.name();
        message.session = this.session;
        
        this.emit(Server_Events.POST_MESSAGE, this._app_list[message.app].app.format_output(message));
    }

    _check_app_config(app)
    {
        if(app in this._app_list)
        {
            let app_l = this._app_list[app];
            app_l.enableable = true;

            if(app_l.app !== null)
            {
                if(!app_l.enabled)
                {
                    app_l.app.enable(true);
                    app_l.enabled = true;
                }
                return;
            }
            if(app_l.class !== null && app_l.app === null)
                this._initiate_app(app_l);
        } else
            this._app_list[app] = {class: null, opt: null, app: null, enabled: false, enableable: true};
    }
}