import {Event_Emitter} from '../../libs/event_emitter.js';
import {Server_Model} from './model.js';
import {Server_View} from './view.js';
import {Server_Events} from './types.js';
import {App_Events} from '../types.js';

export class Server extends Event_Emitter
{
    constructor(id, websocket, app_list)
    {
        super();
        
        this._model = new Server_Model(id, websocket, app_list);
        this._view = new Server_View(this._model);    
        
        this.on(App_Events.ADD_APP, arg => this.register_app(arg.app, arg.opt));
        
        this._model.on(Server_Events.REGISTER_INPUTS, inputs => this.emit(Server_Events.REGISTER_INPUTS, inputs))
                    .on(Server_Events.CLOSE, () => this.emit(Server_Events.CLOSE, this))
                    .on(Server_Events.POST_MESSAGE, message => this.emit(Server_Events.POST_MESSAGE, message))
                    .on(Server_Events.RECEIVED_MESSAGE, message => this.emit(Server_Events.RECEIVED_MESSAGE, message))
                    .on(Server_Events.SERVER_NAME_CHANGE, args => this.emit(Server_Events.SERVER_NAME_CHANGE, args));
        
        this._view.on(Server_Events.CLOSE, () => this.close())
                .on(Server_Events.SERVER_NAME_CHANGE, name => this.name(name))
                .on(Server_Events.SET_AUTOCONNECT, enable => this.autoconnect(enable))
                .on(Server_Events.UPDATE_SESSION, () => this.add_session());
    }
    
    id(){ return this._model.id(); }
    addr(){ return this._model.addr(); }
    full_addr(){ return this._model.full_addr(); }
    name(name){ return this._model.name(name); }
    autoconnect(arg = null){ return this._model.autoconnect(arg); }
    close(){ this._model.close(); }
    add_session(){ return this._model.add_session(); }
    register_app(app, opt = {}){ this._model.register_app(app, opt); }
    
    render(container)
    { 
        this._view.render(container); 
    }
}