import {Event_Emitter} from '../../../libs/event_emitter.js';
import {Events} from './types.js';

import style from './geolocation.css';

const template = document.createElement('template');
template.innerHTML = `
<div id=op-container>
    <button id=button-geo></button>
    <div>
        <div class=option>
            <input type=checkbox id=high-accuracy-check>
            <label for=high-accuracy-check>High Accuracy</label>
        </div>
        <input type=number class='input-number option' id=max-age-input title='Maximum Age' placeholder='Maximum Age (seconds)'>
        <input type=number class='input-number option' id=timeout-input title='Timeout' placeholder='Timeout (seconds)'>
    </div>
</div>
<input type=checkbox id=watch-position-check>
<label for=watch-position-check>Watch position</label>
<closeable-status id=error behaviour=hidden></closeable-status>`;

export class GeoLocation_View extends Event_Emitter
{
    constructor(model)
    {
        super();
        
        this._model = model;
        this._container = null;
        
        this._model.on(Events.ERROR, error => this.error(error))
                    .on(Events.WATCH, set => this.watch(set));
    }
        
    render(container)
    {
        this._container = container; 
        
        const style_el = document.createElement('style');
        style_el.innerHTML = style.toString();
        
        this._container.appendChild(style_el);
        this._container.appendChild(template.content.cloneNode(true));
        
        this._container.querySelector('#button-geo').onclick = ev => {
            if(this._model.watching())
            {
                this.emit(Events.WATCH, false);
                return;
            }
            let opt = {},
                ha = this._container.querySelector('#high-accuracy-check').checked,
                ma = this._container.querySelector('#max-age-input').value,
                to = this._container.querySelector('#timeout-input').value,
                wt = this._container.querySelector('#watch-position-check').checked;
            opt.enableHighAccuracy = ha;
            if(ma) opt.maximumAge = ma * 1000;
            if(to) opt.timeout = to * 1000;
            this.emit(Events.GET_LOCATION, {opt: opt, watch: wt});
        }
    }
    
    watch(set)
    {
        let button = this._container.querySelector('#button-geo');
        if(set)
        {
            button.classList.add('pressed');
        } else {
            button.classList.remove('pressed')
        }
    }
        
    error(msg)
    {
        this._container.querySelector('#error').value = msg;
    }
}