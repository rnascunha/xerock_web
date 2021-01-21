import {App_Daemon_Controller_Template} from '../../core/app/app_controller_template.js';
import {TCP_Client_Model} from './model.js';
import {TCP_Client_View} from './view.js';
import {TCP_Client_Events} from './types.js';

export class TCP_Client_App extends App_Daemon_Controller_Template
{
    constructor(server)
    {
        let model = new TCP_Client_Model(server);
        super(model, new TCP_Client_View(model));

        this._view.on(TCP_Client_Events.OPEN, arg => this.open(arg))
                    .on(TCP_Client_Events.CLOSE, client => this.close(client))
                    .on(TCP_Client_Events.UPDATE, () => this.update())
                    .on(TCP_Client_Events.KEEPALIVE, opt=> this.keepalive(opt));
    }
    
    open(arg){ this._model.open(arg); }
    close(client){ this._model.close(client); }
    update(){ this._model.send_status(); }
    keepalive(opt){ this._model.keepalive(opt); }
}