(function(){
/*
* Keep content streched and centered
* https://stackoverflow.com/q/25311541
*/
const template = document.createElement('template');
template.innerHTML = `
<style>
    :host{
        display: inline-flex;
        margin: 0px;
        border-radius: 6px;
        background-color: var(--closeable-bg, red);
        color: var(--closeable-color, white);
        align-items:center;
        justify-content: space-between;
    }

    #message{
        padding: var(--closeable-padding, 2px);
        background-color: var(--closeable-message-bg, --closeable-bg);
        flex-grow: 1;
    }

    #close
    {
        align-self:stretch;
        display: flex;
        align-items:center;
        color: var(--closeable-close-color, --closeable-color);
        padding: 2px 5px;
        cursor: pointer;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
        background-color: var(--closeable-close-bg, --closeable-bg);
        transition: background-color 0.3s ease;
    }

    #close:hover
    {
        background-color: var(--closeable-bg-hover, white);
        color: var(--closeable-color-hover, red);
    }

    #close:after
    {
        content: var(--closeable-icon, '\u00d7');
    }
</style>
<div id=message>
    <slot></slot>
</div>
<div id=close></div>`;

customElements.define('closeable-status', class extends HTMLElement {
    constructor()
    {
        super();
        
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(template.content.cloneNode(true));
        
        this._message = shadowRoot.querySelector('#message');
        
        this._behaviour = this.close.bind(this);
                
        shadowRoot.querySelector('#close').addEventListener('click', ev => {
//            this.close();
            this._exec_cb();
        });
    }
    
    connectedCallback()
    {
        if(this.hasAttribute('behaviour'))
            this.behaviour = this.getAttribute('behaviour');
        if(this.hasAttribute('value'))
            this.value = this.getAttribute('value');
        if(this.hasAttribute('show'))
            this.show = this.getAttribute('show');
    }
        
    set behaviour(b)
    {
        if(b === 'close' || b === 'hidden' || typeof b ==='function')
            this._behaviour = b;
    }
    
    get behaviour(){ return this._behaviour; }
    
    set value(val)
    {
        this._value = val;
        if(typeof val === 'string')
        {
            this._message.innerHTML = val;
        }
        else if(val instanceof HTMLElement)
        {
            console.log('html', val);
            this._message.appendChild(val);
        }
        this.show = val ? true : false;        
    }
    
    get value(){ 
        return this._value ? this._value : this._message; 
    }
    
    set show(val)
    {
        this._show = Boolean(val);
        this.style.display = this._show ? 'inline-flex' : 'none';
    }
    
    get show(){ return this._show; }
    
    hide()
    {
        this.show = false;
    }
    
    close()
    {
        this.outerHTML = '';
    }
    
    _exec_cb()
    {
        switch(this._behaviour)
        {
            case 'close':
                this.close();
                break;
            case 'hidden':
                this.show = false;
                break;
            default:
                this._behaviour();
        }
    }
});
    
})();