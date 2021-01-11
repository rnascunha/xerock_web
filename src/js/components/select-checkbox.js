//https://stackoverflow.com/a/27547021

(function(){

const template = document.createElement('template');
template.innerHTML =`
<style>
    :host{
        display: inline-block;
    }

    :host([selected]) select
    {
        filter: brightness(0.5);
    }

    #select-box {
        position: relative;
    }

    #select-box select 
    { 
        font-weight: bold;
    }

    #over-select {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
    }

    #checkboxes {
        position: absolute;
        background: white;
        display: none;
        border: 1px #dadada solid;
        padding: 4px;
        max-height: 100px;
        overflow: auto;
        z-index: 2;
    }

    #checkboxes label {
        display: block;
    }

    #checkboxes label:hover {
        background-color: #1e90ff;
    }
</style>

<div id="select-box">
    <select>
        <option>Label</option>
    </select>
        <div id="over-select"></div>
    </div>
</div>
<div id="checkboxes"></div>
`;

customElements.define('select-checkbox', class extends HTMLElement {
    constructor()
    {
        super();

        let shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(template.content.cloneNode(true));
        
        this._expanded = false;
        
        this._checkboxes = shadowRoot.getElementById("checkboxes");
        this._label = shadowRoot.querySelector('select option');
        
        shadowRoot.querySelector('#select-box').addEventListener('click', ev => {
            this.toggle_view();
            ev.stopPropagation();
        });
        
        this._checkboxes.addEventListener('click', ev => {
            ev.stopPropagation();
        });
        
        this._checkboxes.addEventListener('change', ev => {
            this.dispatchEvent(new CustomEvent('change', {detail: ev}));
        });
        
        window.addEventListener('click', e => {
            if (this._expanded == true){
                this.hide();
            }
        });
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
    
    value(value)
    {
        return this._checkboxes.querySelector(`input[value=${value}]`);
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