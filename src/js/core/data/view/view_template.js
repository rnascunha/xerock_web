import {Event_Emitter} from '../../../libs/event_emitter.js';

export class View_Template extends Event_Emitter
{
    constructor(name, options = {})
    {
        super();
        
        this._name = name;
        this._window = null;
        this._options = options;
    }
    
    get name(){ return this._name; }
    get options(){ return this._options; }
    
    render(container)
    {
        console.warn('Method "render" must be overridden!');
    }
    
    window(win = null)
    {
        if(win !== null) this._window = win;
        return this._window;
    }
}