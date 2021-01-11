import {Event_Emitter} from '../../libs/event_emitter.js';
import {App_Events} from '../types.js';

export class App_Controller_Template extends Event_Emitter
{
    constructor(model, view)
    {
        super();
        
        this._model = model;
        this._view = view;
        
        this._model.on(App_Events.SEND_MESSAGE, args => this.emit(App_Events.SEND_MESSAGE, args))
            .on(App_Events.INPUT_REGISTER, args => this.emit(App_Events.INPUT_REGISTER, args))
            .on(App_Events.RECEIVED_MESSAGE, args => this.emit(App_Events.RECEIVED_MESSAGE, args));
    }
    
    name(){ return this._model.name(); }
    long_name(){ return this._model.long_name(); }
    on_message(message){ this._model.on_message(message); }
    format_output(message){ return this._model.format_output(message); }
    message_info(type_info, message, opt){ return this._model.message_info(type_info, message, opt); }
    send(data, id, to, opt){ this._model.send(data, id, to, opt); }
    render(container){ this._view.render(container); }
}

export class App_Daemon_Controller_Template extends App_Controller_Template
{
    constructor(model, view)
    {
        super(model, view);
    }
    
    enable(en){ this._model.enable(en); }
}

export class App_Local_Controller_Template extends App_Controller_Template
{
    constructor(model, view)
    {
        super(model, view);
    }
    
    support(){ return this._model.support(); }
}