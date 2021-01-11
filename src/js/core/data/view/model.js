import {Event_Emitter} from '../../../libs/event_emitter.js';
import {View_Template} from './view_template.js';
import {View_Events} from './types.js';
import {Register_ID_Events} from '../../id/types.js';
import {App_Events} from '../../types.js';

export class View_Model extends Event_Emitter
{
    constructor()
    {
        super();
        
        this._views = {};
        this._open_views = [];
        
        //Emitting events > data > Views
        this.on(Register_ID_Events.CHECK_IDS, args => this._open_views
                                                            .forEach(view => view.emit(Register_ID_Events.CHECK_IDS, args)))
            .on(App_Events.RECEIVED_MESSAGE, data => this._open_views
                                                            .forEach(view => view.emit(App_Events.RECEIVED_MESSAGE, data)));
    }
    
    get opened_views(){ return this._open_views; };
    
    register(name, view, options = {})
    {
        console.assert(View_Template.isPrototypeOf(view), 'View is not instance of "View_Template"');
        this._views[name] = {view: view, options: options};
        
        this.emit(View_Events.REGISTER_VIEW, name);
    }
    
    open(name)
    {
        if(!(name in this._views)) return false;
        
        let view = new this._views[name].view(name, this._views[name].options);
        view.on(Register_ID_Events.PROPAGATE, reg_ids => this.emit(Register_ID_Events.PROPAGATE, reg_ids))
            .on(View_Events.SELECT_ID, args => this.emit(View_Events.SELECT_ID, args));

        this._open_views.push(view)

        this.emit(View_Events.OPEN_VIEW, view);
        return true;
    }
    
    remove(view)
    {
        this._open_views = this._open_views.filter(v => v !== view);
    }
}