import {App_Daemon_Controller_Template} from '../../core/app/app_controller_template.js';
import {UDP_Server_Model} from './model.js';
import {UDP_Server_View} from './view.js';
import {UDP_Server_Events} from './types.js';

export class UDP_Server_App extends App_Daemon_Controller_Template
{
    constructor(server)
    {
        let model = new UDP_Server_Model(server);
        super(model, new UDP_Server_View(model));

        this._view.on(UDP_Server_Events.OPEN, arg => this.open(arg))
                    .on(UDP_Server_Events.CLOSE, server => this.close(server))
                    .on(UDP_Server_Events.CLOSE_CLIENT, client => this.close_client(client))
                    .on(UDP_Server_Events.UPDATE, () => this.update_server())
                    .on(UDP_Server_Events.ADD_CLIENT, args => this.add_client(args.server, args.client));
    }
    
    open(arg){ this._model.open(arg); }
    update_server(){ this._model.send_status(); }
    close(server){ this._model.close(server); }
    close_client(client){ this._model.close_client(client); }
    clients(id){ return this._model.clients(id); }
    add_client(server, client){ return this._model.add_client(server, client); }
}