(function(){

const template = document.createElement('template');
template.innerHTML = `
<style>
    :host{
        display: inline-block;
        margin: 0px;
        padding: 5px;
        overflow: auto;
        height: 100%;
        width: 100%;
        min-with: 100px;
        cursor: text;
        border: 1px solid black;
        border-radius: 6px;
        background-color: white;
    }

    :host(:focus-within)
    {
        outline: 2px solid black;
    }

    :host([disabled])
    {
        background-color: lightgrey;
        cursor: not-allowed;
    }

    #content{
        padding: 0px;
        margin: 0px;
        outline: none;
    }

    #placeholder
    {
        color: lightgray;
        padding: 0px;
        margin: 0px;
    }
</style>
<div id=content contentEditable=true></div>
<div id=placeholder></div>`;

customElements.define('input-resize', class extends HTMLElement {
    constructor()
    {
        super();

        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.tabIndex = 0;
        
        this._edit = this._shadowRoot.querySelector('#content');
        this._placeholder = this._shadowRoot.querySelector('#placeholder');
        this._disabled = false;
        
        this.addEventListener('click', this.focus.bind(this), false);
        this.addEventListener('dblclick', this.select_all.bind(this), false);
        
        this._edit.addEventListener('click', ev => {
            ev.stopPropagation();
        }, false);
        
        this.addEventListener('focus', ev => {
            this.focus();
        }, false);
        
        this._edit.addEventListener('blur', ev => {
            this.blur();
        }, false);
    }
    
    connectedCallback()
    {
        if(this.hasAttribute('placeholder'))
            this.placeholder = this.getAttribute('placeholder');
        if(this.hasAttribute('disabled'))
            this.disabled = true;
    }
    
    set placeholder(ph = '')
    {
        this._placeholder.textContent = ph;
        this._set_placeholder();
    }
    
    _set_placeholder(force = false)
    {
        if(this.value || force){
            this._edit.style.display = 'block';
            this._placeholder.style.display = 'none';
            return;
        }
        
        this._edit.style.display = 'none';
        this._placeholder.style.display = 'block';
    }
    
    set disabled(val)
    {
        if(Boolean(val))
        {
            this._edit.contentEditable = false;
            this._disabled = true;
            this.setAttribute('disabled', '');
        } else {
            this._edit.contentEditable = true;
            this._disabled = false;
            this.removeAttribute('disabled');
        }
    }
    
    get disabled()
    {
        return this._disabled;
    }
            
    focus()
    {
        this._set_placeholder(true);
        let sel = window.getSelection();

        if(this._edit.lastChild){
            let range = document.createRange()
            range.setEnd(this._edit.lastChild, this._edit.lastChild.length);
            range.collapse(false);
            
            sel.removeAllRanges();
            sel.addRange(range);
        } else {
            sel.collapse(this._edit);
        }
    }
    
    blur()
    {
        this._set_placeholder();
    }
    
    select_all()
    {
        let range = document.createRange(),
            sel = window.getSelection();
        
        range.selectNodeContents(this._edit);
        sel.removeAllRanges(); 
        sel.addRange(range);
    }
    
    clear()
    {
        this.value = '';
    }

    set value(value)
    {
        this._edit.textContent = value;
        this._set_placeholder();
    }
    
    get value()
    {
        return this._edit.textContent;
    }
});
    
})();