import {set_menu_position} from '../helper/pointer_events.js';

//https://www.sitepoint.com/building-custom-right-click-context-menu-javascript/
(function(){

const template = document.createElement('template');
template.innerHTML = `
<style>
    :host
    {
        display: none;
        position: absolute;
        z-index: 10;
    }

    :host([show=true])
    {
        display: block;
    }

</style>
<slot></slot>
`;

customElements.define('context-menu', class extends HTMLElement {
    constructor()
    {
        super();
        
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(template.content.cloneNode(true));
        
        this._show = false;
        
        window.addEventListener('resize', ev => {
            this.hide();
        });
        
        this.addEventListener('click', ev => {
            this.dispatchEvent(new CustomEvent('select', {detail: ev}));
            this.hide();
            ev.stopPropagation();
        });
    }
    
    connectedCallback()
    {
        if(this.hasAttribute('show'))
            this.show(this.getAttribute('show') == 'true');
        else
            this.show(false);
    }
    
    get showing(){ return this._show; }
    
    set(ev, show = true)
    {
        set_menu_position(ev, this);
        this.show(show);
    }
    
    show(val = true)
    {
        if(val)
        {
            this._show = true;
            this.setAttribute('show', 'true');
        } else {
            this._show = false;
            this.setAttribute('show', 'false');
        }
    }
    
    hide(val = true){ this.show(!Boolean(val)); }
});
    
})();