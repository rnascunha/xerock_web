import {App_Local_Controller_Template} from '../../../core/app/app_controller_template.js';
import {Orientation_Model} from './model.js';
import {Orientation_View} from './view.js';
import {Events} from './types.js';

export class Orientation_App extends App_Local_Controller_Template
{
    constructor(server)
    {        
        let model = new Orientation_Model(server);
        super(model, new Orientation_View(model));
        
        this._view.on(Events.GET_ORIENTATION, opt => this.orientation(opt.opt, opt.watch))
                    .on(Events.WATCH, () => this.clear_watch())
                    .on(Events.INSTALL_LISTENERS, () => {
                        if(this.installed()) this.uninstall_listeners();
                        else this.install_listeners();
                    });
    }
    
    static support(){ return Orientation_Model.support(); }
    
    orientation(opt, watch = false){ return this._model.orientation(opt, watch); }
    clear_watch(){ this._model.clear_watch(); }
    installed(){ return this._model.installed(); }
    install_listeners(){ this._model.install_listeners(); }
    uninstall_listeners(){ this._model.uninstall_listeners(); }
}