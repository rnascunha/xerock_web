import {App_Local_Controller_Template} from '../../../core/app/app_controller_template.js';
import {WebBluetooth_Model} from './model.js';
import {WebBluetooth_View} from './view.js';
import {Events} from './types.js';

export class WebBluetooth_App extends App_Local_Controller_Template
{
    constructor()
    {        
        let model = new WebBluetooth_Model();
        super(model, new WebBluetooth_View(model));
            
        this._view.on(Events.REQUEST, filters => this.request(filters))
                    .on(Events.GET, () => this.update())
                    .on(Events.OPEN, dev => this.open(dev))
                    .on(Events.CLOSE, dev => this.close(dev))
                    .on(Events.SCAN_LE, filter => this.scan_low_energy(filter));
    }
    
    request(filters = null){ this._model.request(filters) }
    open(dev){ this._model.open(dev); }
    close(dev){ this._model.close(dev); }
    update(){ this._model.update(); }
    scan_low_energy(filter = null){ this._model.scan_low_energy(filter); }
}