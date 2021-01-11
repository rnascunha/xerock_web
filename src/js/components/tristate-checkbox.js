(function(){

    
//True=checked
//False=unchecked
//Null=off
const template = document.createElement('template');
template.innerHTML = `
<style>
    :host{
    }

    input
    {
        position: relative;
        z-index: -9999;
    }

    span
    {
        width: 10px;
        height: 10px;
    }

    :host([value=true]){
        background: green;
    }

    :host([value=false]){
        background: red;
    }

    :host([value=null]){
        background: grey;
    }
</style>
<input type=checkbox>`;

customElements.define('tristate-checkbox', class extends HTMLElement {
    constructor()
    {
        super();

        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this._input = this._shadowRoot.querySelector('input');

        this.tabIndex = 0;
        
        this._value = false;
        this.disabled = false;
        this._input.indeterminate = 
        
        this._input.indeterminate = true;
        this.onclick = ev => {
            if(!this.disabled)
                this.toggle();
        }
    }
    
    connectedCallback()
    {
        if(this.hasAttribute('checked'))
            this.checked = true;
        
        if(this.hasAttribute('disabled'))
            this.disabled = true;
    }
    
    toggle()
    {
        if(this.value === true)
            this.value = false;
        else if(this.value === false)
            this.value = null;
        else this.value = true;
        
        return this.value;
    }
    
    set value(val)
    {
        if(val === false || val === true)
            this._value = val;
        else
            this._value = null;
        
        this.setAttribute('value', this.value === null ? 'null' : this.value);
    }
    
    get value()
    {
        return this._value;
    }
    
    get checked(){ return this.value; }
    set checked(val){ this.value = true; }
    
    set disabled(dis)
    {
        this._input.disabled = Boolean(dis);
    }
    
    get disabled()
    {
        return this._input.disabled;
    }
});
    
})();