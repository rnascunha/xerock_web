//https://stackoverflow.com/a/27547021

(function(){

const template = document.createElement('template');
template.innerHTML =`
<style>
    :host{
        display: inline-block;
    }

    
</style>

<div id="type-select"></div>
<textarea id="content"></textarea>
`;

customElements.define('bytes-converter', class extends HTMLElement {
    constructor()
    {
        super();

        let shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(template.content.cloneNode(true));
        
        
    }
    
    connectedCallback()
    {
        if(this.hasAttribute('label'))
            this.label = this.getAttribute('label');
    }
    
    set label(l){ this._label.textContent = l; }
    
    add_checkbox(value, text = value, checked = false)
    {
        let new_check = document.createElement('label');
        new_check.innerHTML = `<input type=checkbox value=${value} ${checked ? 'checked' : ''}>${text}`;
        
        this._checkboxes.appendChild(new_check);
        
        return new_check;
    }
    
    values()
    {
        return this._checkboxes.querySelectorAll('input[type=checkbox]');
    }
    
    checked()
    {
        return this._checkboxes.querySelectorAll('input[type=checkbox]:checked');
    }
    
    toggle_view()
    {
        if (!this._expanded) {
            this.show();
        } else {
            this.hide();
        }
    }
    
    hide()
    {
        this._checkboxes.style.display = "none";
        this._expanded = false;
    }
    
    show()
    {
        this._checkboxes.style.display = "block";
        this._expanded = true;
    }
});
    
})();