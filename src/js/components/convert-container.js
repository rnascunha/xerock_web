import {Data_Type} from '../libs/byte_array/types.js';
import {Byte_Array} from '../libs/byte_array/byte_array.js';
import {event_path} from '../helper/compatibility.js';

(function(){

const template = document.createElement('template');
template.innerHTML =`
<style>
    :host
    {
        display: inline-flex;
        flex-direction: row;
        border-radius: 5px;
        overflow: hidden;
        border: 1px solid black;
    }

    #types
    {
        display: inline-flex;
        flex-direction: column;
    }

    #types button
    {
        font-weight: bold;
        padding: 10px;
        border-style: outset;
        cursor: pointer;
        outline: none;
        flex-grow: 1;
    }

    #types button:hover
    {
        filter: brightness(95%);
    }

    #types button[data-pressed='true']
    {
        border-style: inset;
        filter: brightness(0.8);
    }

    #content
    {
        display: flex;
        font-family: monospace;
        overflow-y: auto;
        flex-grow: 1;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        padding: 10px;
    }
    
</style>
<div id=types></div>
<div id="content"></div>
`;

customElements.define('convert-container', class extends HTMLElement {
    constructor()
    {
        super();

        let shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(template.content.cloneNode(true));
        
        this._data_container = shadowRoot.querySelector('#content');
        this._types_container = shadowRoot.querySelector('#types');
        
        this._byte_array = new Byte_Array();
        this._type = Data_Type.text.value;
        
        this._types_container.addEventListener('click', ev => {
            let path = event_path(ev);
            this.select(path[0].value);
        });
    }
    
    connectedCallback()
    {
        if(this.hasAttribute('types'))
        {
            try{
                let types = JSON.parse(this.getAttribute('types'));
                if(!Array.isArray(types)) types = [types];
                
                types.forEach(t => this.add_type(t));
            } catch(e){
                console.error(e);
            }
        }
        if(this.hasAttribute('select'))
            this.select(this.getAttribute('select'));
        if(this.hasAttribute('value'))
            this.value(this.getAttribute('value'));
    }
            
    select(type)
    {
        this._types_container.querySelectorAll('button').forEach(b => {
            b.dataset.pressed = b.value === type ? 'true' : 'false';
            try{
                this._data_container.textContent = this._byte_array.to(type);
                this._type = type;
            }catch(e){console.error(e);}
        });
    }
    
    add_type(type, select = false, name = null)
    {
        if(!(type in Data_Type)) return;
        if(this._types_container.querySelector(`[value=${type}]`))
        {
            if(select) this.select(type);
            return;
        }

        let button = document.createElement('button');
        button.value = type;
        button.textContent = name === null ? Data_Type[type].name : name;
        
        this._types_container.appendChild(button);
        
        if(select) this.select(type);
    }
        
    value(value, type = null)
    {
        try{
            if(type == null) type = this._type;
            this._byte_array.from(value, type)
            this.add_type(type, true);
            this._data_container.textContent = this._byte_array.to(type);
        } catch(e){
            console.error(e);
        }
        
        return this._value;
    }
});
    
})();