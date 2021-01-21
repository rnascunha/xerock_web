customElements.define('input-ipv4', class extends HTMLElement {
    constructor()
    {
        super(); // always call super() first in the ctor.

        // Create shadow DOM for the component.
        let shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = `
            <style>
            :host{
                display: inline;
            }

            #input-ipv4{
                width: 17ch;
                padding: var(--input-ipv4-padding, auto);
                margin: var(--input-ipv4-margin, auto);
                border: var(--input-ipv4-border, auto);
                width: var(--input-ipv4-width, auto);
                outline: var(--input-ipv4-outline, auto);
                background-color: var(--input-ipv4-bg, auto);
            }

            #input-ipv4.invalid{
                outline: 2px solid red;
            }
            </style>
            <input id=input-ipv4 list=ipv4-list type="text" size=9>
            <datalist id=ipv4-list></datalist>`;

        this._input_el = shadowRoot.querySelector('#input-ipv4');
        this._list_el = shadowRoot.querySelector('#ipv4-list');
        this._list = [];

        this._input_el.addEventListener("keydown", ev => this.format_ipv4(ev), false);
        this._input_el.addEventListener("focusin", ev => this.set_invalid(false), false);
        this._input_el.addEventListener("focusout", ev => this.set_invalid(!this.is_valid()), false);
        
        if(this.hasAttribute('placeholder')) 
            this.placeholder = this.getAttribute('placeholder');
        
        if(this.hasAttribute('size'))
            this._input_el.size = this.getAttribute('size');
        
        if(this.hasAttribute('disabled'))
            this.disabled(Boolean(this.getAttribute(disabled)));
    }
    
    add(ip_addr)
    {
        if(!this._list.find(ip => ip_addr == ip)){
            this._list.push(ip_addr);
            this._render_list();
            return true;
        }
        return false;
    }
    
    remove(ip_addr)
    {
        this._list = this._list.filter(ip => ip != ip_addr);
        this._render_list();
    }
    
    focus()
    {
        this._input_el.focus();
    }
    
    clear()
    {
        this._list = [];
        this._render_list();
    }
        
    format_ipv4(e)
    {
        if(!(e instanceof KeyboardEvent)) return;

        if(e.key.length > 1 || /[^0-9\.]/.test(e.key)){
            if(e.key != 'Backspace' && e.key != 'Delete')
                e.preventDefault();
        }
        
        if(e.key != 'Backspace' && e.key != 'Delete')
            this.value = this._input_el.value;
    }
    
    is_valid()
    {
        return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(this._input_el.value);
    }
    
    set value(ip_addr)
    {
        let n = ip_addr.match(/25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?\.?/g);
        
        if(n)
            this._input_el.value = n.slice(0,4)                     //Removing extra matchs
                                        .join('.')                  //Join with '.'
                                            .replace(/\.+/g, '.')   //Removing possible double dots
                                                .replace(/(([\d]+\.){3}[\d]+).*/, '$1');    //Removing 4th last undeseariable dot
        else
            this._input_el.value = '';
    }
    
    get value(){ return this._input_el.value; }
    set placeholder(ph){ this._input_el.placeholder = ph; }
    set disabled(value) { this._input_el.disabled = value; }
    get disabled(){ return this._input_el.disabled; }
        
    set_invalid(invalid = true)
    {
        if(invalid)
            this._input_el.classList.add('invalid');
        else 
            this._input_el.classList.remove('invalid');
    }
    
    _render_list()
    {
        this._list_el.innerHTML = '';
        this._list.forEach(ip => {
           let op = document.createElement('option');
            op.value = ip;
            this._list_el.appendChild(op);
        });
    }
});