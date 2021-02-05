import {Event_Emitter} from '../../libs/event_emitter.js';
import {Message_Factory, Message_Type, Control_Type, Message_Direction} from '../libs/message_factory.js';
import {App_Events, Message_Info} from '../types.js';
import {copy} from '../../helper/object_op.js';
//import {Local_Server} from '../server/local_server.js';

export class App_Template extends Event_Emitter
{
    constructor(name, server, long_name = name)
    {
        super();
        this._name = name;
        this._server = server;
        this._long_name = long_name;
    }
    
    long_name(){ return this._long_name; }
    name(){ return this._name; }
    server(){ return this._server; }
        
    update_ids(ids = [])
    {
        if(!Array.isArray(ids)) ids = [ids];
        this.emit(App_Events.INPUT_REGISTER, {server: this.server(), app: this, ids: ids});
    }
        
    render(container)
    {
        console.log("The 'render' method must create the configuration menu of the application. It receives de container where the menu must be created");
        console.assert("You need to override this method ('render(container)')");
    }
    
    on_message(message)
    {
        switch(message.type)
        {
            case Message_Type.control.value:
                this._control_message(message);
                break;
            case Message_Type.data.value:
                this._data_message(message);
                break;
            default:
                this.error_message('undefined type message', message);
                return;
        }
        this.emit(App_Events.RECEIVED_MESSAGE, message);
    }
    
    format_output(message)
    {
        let new_message = copy(message);
        new_message.data = [];
        
        switch(message.type)
        {
            case Message_Type.data.value:
                this._format_output_data(new_message, message);
                break;
            case Message_Type.control.value:
                this._format_output_control(new_message, message);
                break;
            default:
                this.error_message('undefined type message', message);
                break;
        }
        return new_message;
    }
    
    error_message(description, message)
    {
        console.error(this.name(), description, message);
    }
    
    message_info(type_info, message, opt)
    {
        console.error('The "message_info" method must return the infomations request by the parameter "type_info". This was a way to unifity access to information provided diferently by difernte programs');
        /**
        * Should be someting like:
        * 
        switch(type_info){
            case Message_Info.ID: 
                return <id of message>
            case Message_Info.FROM:
                return <from who was the message>
            case Message_Info.DATA_OUTPUT:
                return <array with the data of the message>
            case Message_Info.DATA_FIELD:
                return <which field of the DATA_OUTPUT is the data message>
        }
        return null;
        *
        *
        */
    }
    
    _format_output_data(new_message, message)
    {
        new_message.id = this.message_info(Message_Info.ID, message);
        new_message.id_str = this.message_info(Message_Info.ID_STRING, message);
        new_message.data = this.message_info(Message_Info.DATA_OUTPUT, message);
        
        let data_field = this.message_info(Message_Info.DATA_FIELD);
        if(data_field != null && typeof data_field == 'number')
            new_message.data_field = data_field;
        
        let from = this.message_info(Message_Info.FROM, message);
        if(from != null)
            new_message.from = from;
        
        let from_str = this.message_info(Message_Info.FROM_STRING, message);
        if(from_str != null)
            new_message.from_str = from_str;        
    }
        
    _format_output_control(new_message, message)
    {
        switch(message.ctype)
        {
            case Control_Type.status.value:
                this._format_control_status(new_message, message);
                break;
            case Control_Type.config.value:
                this._format_control_config(new_message, message);
                break;
            case Control_Type.custom.value:
                this._format_control_custom(new_message, message);
                break;
            case Control_Type.open.value:
                this._format_control_open(new_message, message);
                break;
            case Control_Type.close.value:
                this._format_control_close(new_message, message);
                break;
            case Control_Type.error.value:
                this._format_control_error(new_message, message);
                break;
            default:
                this.error_message('undefined format_output control type message', message); 
                break;
        }
    }
    
     _format_control_close(new_message, message)
    {
        console.warn(this.name(), 'format output control close', message);
    }
    
    _format_control_open(new_message, message)
    {
        console.warn(this.name(), 'format output control open', message);
    }
    
    _format_control_custom(new_message, message)
    {
        console.warn(this.name(), 'format output control custom', message);
    }
    
    _format_control_config(new_message, message)
    {
        console.warn(this.name(), 'format output control config', message);
    }
    
    _format_control_status(new_message, message)
    {
        console.warn(this.name(), 'format output control status', message);
    }
    
    _format_control_error(new_message, message)
    {
        let what = "";
        if(message.data.hasOwnProperty('what') && message.data.what.length > 0){
            what = ` (${message.data.what})`
        }
        new_message.data.push(`[${message.data.code}] ${message.data.message}${what}`);
    }
            
    _data_message(message)
    {
    }
        
    _control_message(message){
        switch(message.ctype)
        {
            case Control_Type.status.value:
                this._control_status(message);
                break;
            case Control_Type.config.value:
                this._control_config(message);
                break;
            case Control_Type.custom.value:
                this._control_custom(message);
                break;
            case Control_Type.open.value:
                this._control_open(message);
                break;
            case Control_Type.close.value:
                this._control_close(message);
                break;
            case Control_Type.error.value:
                this._control_error(message);
                break;
            default:
                this.error_message('undefined control type message', message); 
                break;
        }
    }
    
    _control_close(message)
    {
        console.warn(this.name(), 'control close', message);
    }
    
    _control_open(message)
    {
        console.warn(this.name(), 'control open', message);
    }
    
    _control_custom(message)
    {
        console.warn(this.name(), 'control custom', message);
    }
    
    _control_config(message)
    {
        console.warn(this.name(), 'control config', message);
    }
    
    _control_status(message)
    {
        console.warn(this.name(), 'control status', message);
    }
    
    _control_error(message)
    {
        console.warn(this.name(), 'control error', message);
    }
}

export class App_Daemon_Template extends App_Template
{
    constructor(name, server, long_name = name)
    {
        super(name, server, long_name);
    }
    
    enable(en)
    {
        console.log("The 'enable' method is called whenever the browser connect (param true) or close (param false) connection with the daemon. The application must show the configurations when connect, and hide when not connected")
        console.assert("You need to override this method ('enable(en)')");
    }
    
    send(data, id, to, opt = {})
    {
        let msg = this.send_data(data, id, to, opt);
        if(msg)
            this.emit(App_Events.SEND_MESSAGE, 
                  Message_Factory.create(this.name(), Message_Type.data.value, null, msg));
    }
    
    send_data(data, id, to, opt = {})
    {
        console.assert(false, "'send_data' method must be overriden");
    }
    
    send_control(ctype, data = null)
    {
        this.emit(App_Events.SEND_MESSAGE, Message_Factory.create(this.name(), Message_Type.control.value, ctype, data));
    }
}

export class App_Local_Template extends App_Template
{
    constructor(name, server, long_name = name)
    {
        super(name, server, long_name);
    }
    
    support()
    {
        console.warn("Method 'support' MUST be overriden");
        return false;
    }
    
    send(data, id, to, opt)
    {
        let msg = this._make_message(this.send_data(data, id, to, opt), Message_Direction.sent.value, Message_Type.data.value);
        this.emit(App_Events.SEND_MESSAGE, this.format_output(msg));
    }
    
    send_data(data, id, to, opt = {})
    {
        console.assert(false, "'send_data' method must be overriden");
    }
    
    post_data(data, id, received = true)
    {
        let msg = this._make_message(data, received ? Message_Direction.received.value : 
                                     Message_Direction.sent.value, Message_Type.data.value);
        this.emit(App_Events.SEND_MESSAGE, this.format_output(msg));
    }
        
    control(ctype, data = null)
    {
        let msg = this._make_message(data, Message_Direction.received.value, Message_Type.control.value, ctype);
        this.emit(App_Events.SEND_MESSAGE, this.format_output(msg));
    }
    
    send_control(ctype, data = null)
    {
        let msg = this._make_message(data, Message_Direction.sent.value, Message_Type.control.value, ctype);
        this.emit(App_Events.SEND_MESSAGE, this.format_output(msg));
    }
    
    received_data(message)
    {
        let msg = this._make_message(message, Message_Direction.received.value, Message_Type.data.value);
        this.emit(App_Events.RECEIVED_MESSAGE, this.format_output(msg));
    }
    
    _make_message(data, direction, type, ctype = null)
    {
        let msg = Message_Factory.create(this.name(), type, ctype, data);
        msg.dir = direction;
        msg.sid = this.server().id();
        msg.saddr = this.server().addr();
        msg.sname = this.server().name();
        msg.uid = direction === Message_Direction.received.value ? this.server().server_user_id() : this.server().user_id();
        msg.smid = this.server().server_message_id();
        msg.session = this.server().session;
        
        return msg;
    }
}