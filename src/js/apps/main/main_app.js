import {App_Daemon_Template} from '../../core/app/app_template.js';
import {Server_Events} from '../../core/server/types.js';
import {App_List} from '../app_list.js';

export class Main_App extends App_Daemon_Template
{
    constructor(server)
    {
        super(App_List.MAIN.name, server);
        this._server = server;
    }
    
    enable(){}
    
    _format_control_config(new_message, message)
    {
        new_message.data = [message.data.join(' ')];
    }
    
    _format_control_status(new_message, message)
    {
        if(!('data' in message))
        {
            console.warn('[Main App] ill formated message', message);
            return;
        }
        
        if(message.data.hasOwnProperty('nusers'))
            new_message.data.push('nusers=' + message.data.nusers);
        if(message.data.hasOwnProperty('uid'))
            new_message.data.push('uid=' + message.data.uid);
    }
    
    _control_config(message)
    {
        this._server.emit(Server_Events.CONFIG_MESSAGE, message.data);
//        message.data.forEach(app => {
//            if(app in this._server._app_list)
//                this._server._app_list[app].enable(true);
//        });
    }
    
    _control_status(message)
    {
        if(!('data' in message))
        {
            console.warn('[Main App] ill formated message', message);
            return;
        }
        
        if(message.data.hasOwnProperty('uid'))
            this._server._uid = message.data.uid;
        if(message.data.hasOwnProperty('nusers'))
            this._server._num_users = message.data.nusers;
        
        this._server.emit(Server_Events.STATUS_MESSAGE, {uid: this._uid, nusers: this._num_users});
    }
}