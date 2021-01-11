import {App_Daemon_Controller_Template} from '../../core/app/app_controller_template.js';
import {Serial_App_Model} from './model.js';
import {Serial_App_View} from './view.js';
import {Serial_Events} from './define.js';

export class Serial_App extends App_Daemon_Controller_Template
{
    constructor(server)
    {
        let model = new Serial_App_Model(server);
        super(model, new Serial_App_View(model));
        
        this._view.on(Serial_Events.OPEN, port_op => this.open(port_op))
            .on(Serial_Events.CLOSE, port => this.close(port))
            .on(Serial_Events.STATUS, () => this.get_status());
    }
                
    open(open_op){ this._model.open(open_op); }
    close(port){ this._model.close(port); }
    get_status(){ this._model.serial_status(); }
}
