import {App_Daemon_Controller_Template} from '../../core/app/app_controller_template.js';
import {Monitor_App_Model} from './model.js';
import {Monitor_App_View} from './view.js';
import {Monitor_Events} from './types.js';

export class Monitor_App extends App_Daemon_Controller_Template
{
    constructor(server)
    {
        let model = new Monitor_App_Model(server);
        super(model,  new Monitor_App_View(model));
    }
}