import {App_Local_Controller_Template} from '../../../core/app/app_controller_template.js';
import {WebSocket_Client_Model} from './model.js';
import {WebSocket_Client_View} from './view.js';
import {Events} from './types.js';

export class WebSocket_Client_App extends App_Local_Controller_Template
{
    constructor()
    {        
        let model = new WebSocket_Client_Model();
        super(model, new WebSocket_Client_View(model));
            
        this._view.on(Events.OPEN, args => this.open(args.addr, args.port, args.secure))
                    .on(Events.CLOSE, id => this.close(id));
    }
    
    open(addr, port, secure){ return this._model.open(addr, port, secure); }
    close(id){ this._model.close(id); }
    update(){ this._model.update(); }
}