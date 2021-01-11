import {Event_Emitter} from '../../../libs/event_emitter.js';
import {columns, html} from './types.js';
import {Select_Events, Set_Select_Type} from './types.js';

export class Select_View extends Event_Emitter
{
    constructor(model, container)
    {
        super();
        
        this._model = model;
        this._container = container;
        
        let shadow = this._container.attachShadow({mode: 'open'});
        shadow.innerHTML = html;
        this._select_container = shadow.querySelector('#container');
        
        this._model.on(Select_Events.SET_SELECTED, arg => this.select(arg));
    }
    
    render(sel)
    {
        this._select_container.innerHTML = "";
        
        this._model.columns().forEach(c => {
           let co = document.createElement('button');
            co.setAttribute('class', 'sel-button');
            co.textContent = c;
            co.dataset.value = c;
            co.title = columns[c].description;

            co.addEventListener('click', ev => 
                                this.emit(Select_Events.SET_SELECTED, {type: this._model.is_selected(c) ? 
                                                                           Set_Select_Type.REMOVE : 
                                                                           Set_Select_Type.ADD, 
                                                                        column: c}));
            
            this._select_container.appendChild(co);
        });
        this.select(this._model.select());
    }
    
    select(selected)
    {
        this._select_container.querySelectorAll('.sel-button').forEach(co =>
             this._set_selected_class(co, this._model.is_selected(co.dataset.value)));
    }
                                                                
    _set_selected_class(column, selected)
    {
        if(selected)
        {
            column.classList.add('sel-selected');
            column.classList.remove('sel-unselected');
        } else {
            column.classList.add('sel-unselected');
            column.classList.remove('sel-selected');
        }
    }
}
    