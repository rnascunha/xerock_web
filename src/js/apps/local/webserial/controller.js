import {App_Local_Controller_Template} from '../../../core/app/app_controller_template.js';
import {WebSerial_Model} from './model.js';
import {WebSerial_View} from './view.js';
import {Events} from './types.js';

export class WebSerial_App extends App_Local_Controller_Template
{
    constructor()
    {        
        let model = new WebSerial_Model();
        super(model, new WebSerial_View(model));
            
        this._view.on(Events.REQUEST, filters => this.request(filters))
                    .on(Events.GET, () => this.update())
                    .on(Events.OPEN, args => this.open(args.id, args.opts))
                    .on(Events.CLOSE, id => this.close(id));
    }
    
    request(filters){ this._model.request(filters) }
    open(id, opts){ this._model.open(id, opts); }
    close(id){ this._model.close(id); }
    update(){ this._model.update(); }
}