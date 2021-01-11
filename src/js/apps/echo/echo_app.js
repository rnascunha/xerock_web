import {App_Daemon_Template} from '../../core/app/app_template.js';
import {App_List} from '../app_list.js';
import {App_Events, Message_Info} from '../../core/types.js';
import {Input_Type} from '../../core/input/types.js';
import {App_ID_Template, ID_Types} from '../../core/id/id_template.js';

class Echo_ID extends App_ID_Template
{
    constructor(app)
    {
        super(app.server().id(), app, app.server().id(), ID_Types.One2One);
    }
    
    name()
    {
        return `${this._app.name()}:${this._name}`;
    }
    
    compare_message_id(message, exactly = false)
    {
        return this.server().id() == message.sid;
    }
}

export class Echo_App extends App_Daemon_Template
{
    constructor(server)
    {
        super(App_List.ECHO.name, server);
        this._app_id = server.id();
        this._server_name = server.id();
        
        this.on(App_Events.SERVER_NAME_CHANGE, name => this.server_name(name));
    }
    
    enable(en){
        if(en)
            this.update_ids(new Echo_ID(this));
    }
  
    send_data(data, id, to, opt = {})
    {
        let type = typeof data == 'string' ? Input_Type.text.value : Input_Type.hex.value;
        if(opt.hasOwnProperty('data_type')) type = opt.data_type;
        
        return {type: type, data: data};
    }
    
    message_info(type_info, message, opt)
    {
        switch(type_info){
            case Message_Info.ID: 
            case Message_Info.FROM:
                return this._app_id;
            case Message_Info.ID_STRING:
            case Message_Info.FROM_STRING:
                return `${this._app_id}`;
            case Message_Info.DATA_OUTPUT:
                return [message.data.type, message.data.data];
            case Message_Info.DATA_FIELD:
                return 1;
            case Message_Info.IS_SAME_ID:
            case Message_Info.IS_SAME_ID_EXACTLY:
                return true;
        }
        return null;
    }
    
    server_name(name)
    {
        this._server_name = name;
        this.update_ids(new Echo_ID(this));
    }
}
