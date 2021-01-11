
(function(){
const state = {
    DOCKED: Symbol('docked'),
    UNDOCKED: Symbol('undocked'),
    MAXIMIZED: Symbol('maximized')
}

const template = document.createElement('template');
template.innerHTML = `
<style>
    :host{
        position: relative;
        margin: 0px;
        padding: 0px;
        overflow: auto;
        contain: strict;
    }

    .icons{
        display: flex;
        position: absolute;
        right: 5px;
        top: 0px;
        cursor: pointer;
        align-items: center;
        padding: 0px;
        margin: 0px;
    }

    .close{
        font-size: 25px;
    }

    .close:after{
        content: '\xd7';
    }

    .maximize:after{
        content: '\u25a1';
    }

    .minimize:after{
        content: '_';
    }

    .undock:after{
        content: '\u2B1A';
    }

    .icon{
        padding: 0px;
        margin: 0px;
        z-index: 5;
    }

    .icon:hover
    {
        font-weight: bold;
        transform: translateY(1px);
    }
</style>

<div class=icons>
<slot name=icon></slot>
    <span class='undock icon' title=undock></span>
    <span class='minimize icon' title=minimize></span>
    <span class='maximize icon' title=maximize></span>
    <span class='close icon' title=close></span>
</div>
<slot></slot>`;

customElements.define('w-container', class extends HTMLElement {
    constructor()
    {
        super();

        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        
        this.name = this._check_attr('name', '');
        this._status = state.DOCKED;
        
        this._is_closeable = this._check_attr('closeable', true);
        this._is_maximizable = this._check_attr('maximizable', true);
        this._is_undockable = this._check_attr('undockable', false);
                
        this._icons = {
            minimize: this._shadowRoot.querySelector('.minimize'),
            maximize: this._shadowRoot.querySelector('.maximize'),
            close: this._shadowRoot.querySelector('.close'),
            undock: this._shadowRoot.querySelector('.undock')
        }
                
        if(this._is_closeable)
            this._set_enable(this._icons.close, 'close')
        else
            this._set_disable(this._icons.close);
        
        if(this._is_maximizable){
            this._set_enable(this._icons.maximize, 'maximize');
            this._set_enable(this._icons.minimize, 'minimize');
        } else{
            this._set_disable(this._icons.maximize);
            this._set_disable(this._icons.minimize);
        }

        if(this._is_undockable)
            this._set_enable(this._icons.undock, 'undock');
        else
            this._set_disable(this._icons.undock);
        
        this.status();
    }
    
    set name(value)
    {
        this._name = value;
    }
    
    get name()
    {
        return this._name;
    }
    
    status()
    {
        if(!this._is_maximizable) return;
        switch(this._status)
        {
            case state.DOCKED:
                this._icons.minimize.style.display = 'none';
                this._icons.maximize.style.display = 'inline';
                break;
            case state.MAXIMIZED:
                this._icons.minimize.style.display = 'inline';
                this._icons.maximize.style.display = 'none';
                break;
        }
    }
    
    _check_attr(name, def = true)
    {
        return !this.hasAttribute(name) ? def : 
                                (this.getAttribute(name) === 'false' ? false : def);
    }
    
    set_maximize()
    {
        this._status = state.MAXIMIZED;
        this.status();
    }
    
    set_minimize()
    {
        this._status = state.DOCKED;
        this.status();
    }
    
    _set_enable(target, event_name)
    {
        target.onclick = ev => {
            this.dispatchEvent(new Event(event_name));
        }
        target.style.display = 'inline';
    }
    
    _set_disable(target)
    {
       target.style.display = 'none';
    }
});
})();
