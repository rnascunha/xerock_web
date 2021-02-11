import {App_Daemon_Controller_Template} from '../../core/app/app_controller_template.js';
import {UDP_Client_Model} from './model.js';
import {UDP_Client_View} from './view.js';
import {UDP_Client_Events} from './types.js';

export class UDP_Client_App extends App_Daemon_Controller_Template
{
    constructor(server)
    {
        let model = new UDP_Client_Model(server);
        super(model, new UDP_Client_View(model));

        this._view.on(UDP_Client_Events.OPEN, arg => this.open(arg))
                    .on(UDP_Client_Events.CLOSE, client => this.close(client))
                    .on(UDP_Client_Events.UPDATE, () => this.update());
    }
    
    open(arg){ this._model.open(arg); }
    close(client){ this._model.close(client); }
    update(){ this._model.send_status(); }
}