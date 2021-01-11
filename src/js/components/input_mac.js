customElements.define('input-mac', class extends HTMLElement {
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

            #input-mac{
                width: 17ch;
            }

            #input-mac.invalid{
                outline: 2px solid red;
            }
            </style>
            <input type=text maxlength=17 list=mac-list id=input-mac>
            <datalist id=mac-list></datalist>`;

        this._input_el = shadowRoot.querySelector('#input-mac');
        this._list_el = shadowRoot.querySelector('#mac-list');
        this._list = [];

        this._input_el.addEventListener("keydown", ev => this.format_mac(ev), false);
        this._input_el.addEventListener("focusin", ev => this.set_invalid(false), false);
        this._input_el.addEventListener("focusout", ev => this.set_invalid(!this.is_valid()), false);
        
        if(this.hasAttribute('placeholder')) 
            this.placeholder = this.getAttribute('placeholder');
    }
    
    add(mac_addr)
    {
        if(!this._list.find(mac => mac_addr == mac)){
            this._list.push(mac_addr);
            this._render_list();
        }
    }
    
    remove(mac_addr)
    {
        this._list = this._list.filter(mac => mac != mac_addr);
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
        
    format_mac(e)
    {
        if(e.key != 'Backspace' && e.key != 'Delete')
            this.value = e.target.value;
    }
    
    is_valid()
    {
        return this._input_el.value.length == 17;
    }
    
    set value(mac_addr)
    {
        let r = /([a-f0-9]{2})([a-f0-9]{1,2})/i,
            str = mac_addr.replace(/[^a-f0-9]/ig, "");

        while (r.test(str)) {
            str = str.replace(r, '$1' + ':' + '$2');
        }

        this._input_el.value = str.slice(0, 17);
    }
    
    get value()
    {
        return this._input_el.value;
    }
    
    set placeholder(ph)
    {
        this._input_el.placeholder = ph;
    }
        
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
        this._list.forEach(mac => {
           let op = document.createElement('option');
            op.value = mac;
            this._list_el.appendChild(op);
        });
    }
});