import {App_Local_Controller_Template} from '../../../core/app/app_controller_template.js';
import {WebUSB_Model} from './model.js';
import {WebUSB_View} from './view.js';
import {Events} from './types.js';

export class WebUSB_App extends App_Local_Controller_Template
{
    constructor()
    {        
        let model = new WebUSB_Model();
        super(model, new WebUSB_View(model));
            
        this._view.on(Events.REQUEST, filters => this.request(filters))
                    .on(Events.GET, () => this.update())
                    .on(Events.OPEN, args => this.open(args.id, args.driver, args.opts))
                    .on(Events.CLOSE, id => this.close(id));
    }
    
    request(filters){ this._model.request(filters) }
    open(id, driver, opts = {}){ this._model.open(id, driver, opts); }
    close(id){ this._model.close(id); }
    update(){ this._model.update(); }
    register_driver(name, driver) { return this._model.register_driver(name, driver); }
}