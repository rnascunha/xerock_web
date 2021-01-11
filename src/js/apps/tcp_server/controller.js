import {App_Daemon_Controller_Template} from '../../core/app/app_controller_template.js';
import {TCP_Server_Model} from './model.js';
import {TCP_Server_View} from './view.js';
import {TCP_Server_Events} from './types.js';

export class TCP_Server_App extends App_Daemon_Controller_Template
{
    constructor(server)
    {
        let model = new TCP_Server_Model(server);
        super(model, new TCP_Server_View(model));

        this._view.on(TCP_Server_Events.OPEN, arg => this.open(arg))
                    .on(TCP_Server_Events.CLOSE, server => this.close(server))
                    .on(TCP_Server_Events.CLOSE_CLIENT, client => this.close_client(client))
                    .on(TCP_Server_Events.UPDATE, () => this.update_server())
                    .on(TCP_Server_Events.KEEPALIVE, opt=> this.keepalive(opt));
    }
    
    open(arg){ this._model.open(arg); }
    update_server(){ this._model.send_status(); }
    close(server){ this._model.close(server); }
    close_client(client){ this._model.close_client(client); }
    clients(id){ return this._model.clients(id); }
    keepalive(opt = null){ return this._model.keepalive(opt); }
}