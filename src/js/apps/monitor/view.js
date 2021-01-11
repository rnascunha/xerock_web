import {Event_Emitter} from '../../libs/event_emitter.js';
import {Monitor_Events, Monitor_Limits} from './types.js';

import style from './monitor.css';

const template = document.createElement('template');
template.innerHTML = `
<div id=container>
    <label for=sample>Sample time: </label>
    <input type=number name=sample id=sample min=${Monitor_Limits.min} max=${Monitor_Limits.max} style="width:6ch" value=3>
    <input type=checkbox name=continuo id=continuo>
    <label for=continuo>continuous</label>
    <div>
        <button id=button-send>Send</button>
        <button id=button-cancel>Cancel</button>
    </div>
    <div id=error><div>
</div>`

export class Monitor_App_View extends Event_Emitter{
    constructor(model){
        super();
        
        this._container = null;
        
        this._model = model;
        model.on(Monitor_Events.ERROR, args => this.error(args));
    }
    
    render(container)
    {
        this._container = container;
        
        const style_el = document.createElement('style');
        style_el.innerHTML = style.toString();
        
        this._container.appendChild(style_el);
        this._container.appendChild(template.content.cloneNode(true));
        
        this._container.querySelector('#button-send').onclick = (ev) => {
            let sample = this._container.querySelector('#sample').value,
                continuo = this._container.querySelector('#continuo').checked;
            
            this._model.emit(Monitor_Events.SEND, {sample: sample, cont: continuo});
        }
        
        this._container.querySelector('#button-cancel').onclick = (ev) => {
            this._model.emit(Monitor_Events.CANCEL);
        } 
    }
    
    error(msg){
        this._container.querySelector('#error').textContent = msg;
    }
}