import {Event_Emitter} from '../../../libs/event_emitter.js';
import {Events} from './types.js';
import {Orientation_Model} from './model.js';

import style from './orientation.css';

const template = document.createElement('template');
template.innerHTML = `
<div id=op-container>
    <div id=in-op-container>
        <button id=button-ori></button>
        <div class=option>
            <input type=checkbox id=orientation-check checked>
            <label for=orientation-check>Orientation</label><br>
            <input type=checkbox id=motion-check checked>
            <label for=motion-check>Motion</label>
        </div>
    </div>
    <button id=install-listeners></button>
</div>
<input type=checkbox id=watch-position-check>
<label for=watch-position-check>Watch position</label>
<input type=number value=1000 min=1 id=watch-interval title='Watch Interval (ms)' placeholder='Watch interval'>ms
<closeable-status id=error behaviour=hidden></closeable-status>`;

export class Orientation_View extends Event_Emitter
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
        
        let ori = this._container.querySelector('#orientation-check'),
            mot = this._container.querySelector('#motion-check'),
            wt = this._container.querySelector('#watch-position-check'),
            int = this._container.querySelector('#watch-interval'),
            install = this._container.querySelector('#install-listeners'),
            button = this._container.querySelector('#button-ori');
        
        this.set_install();
        install.onclick = ev => {
            this.emit(Events.INSTALL_LISTENERS);
            this.set_install();
        }
        
        if(!Orientation_Model.support_orientation())
        {
            ori.checked = false;
            ori.disabled = true;
        }
        
        if(!Orientation_Model.support_motion())
        {
            mot.checked = false;
            mot.disabled = true;
        }
        
        int.disabled = !wt.checked;
        wt.onchange = ev => {
            int.disabled = !wt.checked;
        }
                
        button.onclick = ev => {
            if(!this._model.installed())
            {
                this.error('Listeners not installed');
                return;
            }
            if(this._model.watching())
            {
                this.emit(Events.WATCH, false);
                return;
            }
            
            if(!ori.checked && !mot.checked)
            {
                this.error('At least one option need to be selected');
                return;
            }
            
            this.error('');
            
            this.emit(Events.GET_ORIENTATION, {opt: {
                    orientation: ori.checked,
                    motion: mot.checked
            }, watch: wt.checked ? (int.value && int.value > 0 ? int.value : 0) : false });
        }
    }
    
    set_install()
    {
        let install = this._container.querySelector('#install-listeners'),
            button = this._container.querySelector('#button-ori');
        if(this._model.installed())
        {
            install.dataset.installed = true;
            button.disabled = false;
        }
        else {
            install.dataset.installed = false;
            button.disabled = true;
        }
    }
    
    watch(set)
    {
        let button = this._container.querySelector('#button-ori');
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