import {App_Local_Controller_Template} from '../../../core/app/app_controller_template.js';
import {GeoLocation_Model} from './model.js';
import {GeoLocation_View} from './view.js';
import {Events} from './types.js';

export class GeoLocation_App extends App_Local_Controller_Template
{
    constructor(server)
    {        
        let model = new GeoLocation_Model(server);
        super(model, new GeoLocation_View(model));
        
        this._view.on(Events.GET_LOCATION, opt => this.location(opt.opt, opt.watch))
                    .on(Events.WATCH, () => this.clear_watch())
    }
    
    static support(){ return GeoLocation_Model.support(); }
    
    location(opt, watch = false)
    {
        return this._model.location(opt, watch);
    }
    
    clear_watch()
    {
        this._model.clear_watch();
    }
}