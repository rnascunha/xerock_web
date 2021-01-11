import {check_element_click} from '../helper/pointer_events.js';

export class Context_Menu
{
    constructor(element = null, event = null, show = null)
    {
        this._menu = null;
        this.init();
        
        if(element) this.make(element, event, show);
    }
    
    init()
    {
        if(this._menu) return;
        
        this._menu = document.createElement('context-menu');
            
        document.addEventListener('click', ev => {
            if(this._menu.showing && !check_element_click(ev, this._menu))
            {
                this._menu.hide();
                this._menu.innerHTML = '';
            }
        });

        document.addEventListener('contextmenu', ev => {
            if(this._menu.showing && !check_element_click(ev, this._menu))
            {
                this._menu.hide();
                this._menu.innerHTML = '';
            }
        });

        document.body.appendChild(this._menu);
    }
    
    make(element = null, event = null, show = null)
    {        
        this._menu.innerHTML = '';
        if(element) this._menu.appendChild(element);
        if(event) this.set(event, show);
    }
    
    get showing(){ return this._menu.showing; }
    set(event, show = null){ this._menu.set(event, show); }
    show(){ this._menu.show(); }
    hide()
    {
        this._menu.innerHTML = '';
        this._menu.hide(); 
    }
}
