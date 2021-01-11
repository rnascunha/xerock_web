import {Event_Emitter} from '../../../libs/event_emitter.js';
import {Input_Events} from '../types.js';
import {Commands_View} from './view.js';

export class Commands extends Event_Emitter
{
    constructor(container)
    {
        super();
        this._list = [];
        
        this._view = new Commands_View(this, container);
    }
    
    register(comm)
    {
        this._list.push(comm);
        comm.on(Input_Events.SET_INPUT, comm => this.emit(Input_Events.SET_INPUT, comm))
             .on(Input_Events.SEND_INPUT, comm => this.emit(Input_Events.SEND_INPUT, comm));
        
        this.emit('render');
    }
}

export class Command_Template extends Event_Emitter
{
    constructor(name)
    {
        super();
        this._name = name;
        this._opened = false;
    }
    
    name()
    {
        return this._name;
    }
    
    open(opened = null)
    {
        if(opened != null) this._opened = opened ? true : false;
        return this._opened;
    }
    
    render()
    {
        console.warn('Method "render" must be overrided');
        let div = document.createElement('div');
        div.textContent = 'Method "render" must be overrided';
        
        return div;
    }
}
