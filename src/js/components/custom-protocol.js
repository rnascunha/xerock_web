import {Byte_Array} from '../libs/byte_array/byte_array.js';
import {Data_Type} from '../libs/byte_array/types.js';
import {generate_random_color} from '../helper/color.js';

(function(){
    
const template = document.createElement('template');
template.innerHTML = `
<style>
    :host
    {
        display: inline-flex;
        flex-direction: column;
    }

    #custom-container
    {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
    }

    #error-item
    {
        display: inline-block;
        box-sizing: border-box;
        background-color: red;
        color: white;
        padding: 1px, 3px;
    }

    .custom-item
    {
        background-color: yellow;
        padding: 4px;
        display: inline-flex;
        flex-direction: row;
    }

    .value
    {
        display: inline-block;
        filter: invert(1);
        /* text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black; */
    }

    .custom-item-opt
    {
        display: flex;
        flex-direction: row;
    }

    .custom-input
    {
        width: 100%;
    }

    .custom-close
    {
        background-color: white;
        color: red;
        padding: 2px 5px;
        cursor: pointer;
        border-radius: 3px;
        display: flex;
        align-items: center;
    }

    .custom-close:hover
    {
        background-color: red;
        color: white;
        box-sizing: content-box;
    }

    #add-custom, #calculate{
        cursor: pointer;
    }
</style>

<div id=custom-container></div>
<div>
    <button id=add-custom>+</button>
    <button id=calculate>calculate</button>
    <span id=error-item>Error</span>
    <slot></slot>
</div>`;

const template_item = document.createElement('template');
template_item.innerHTML = `
<div class=custom-item>
    <div class=custom-item-opt-out>
        <div class=custom-item-opt>
            <select class=custom-select></select>
            <input class=custom-input placeholder=value>
        </div>
        <div class=value></div>
    </div>
    <span class=custom-close>&times;</span>
</div>`;
    
Object.keys(Data_Type).forEach(type => {            
let op = document.createElement('option');
    op.textContent = Data_Type[type].name;
    op.value = Data_Type[type].value;
    template_item.content.querySelector('.custom-select').appendChild(op);
});
    
customElements.define('custom-protocol', class extends HTMLElement {
    constructor()
    {
        super();
        
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(template.content.cloneNode(true));
        
        this._add_btn = shadowRoot.querySelector('#add-custom'),
        this._custom_contaienr = shadowRoot.querySelector('#custom-container'),
        this._calculate = shadowRoot.querySelector('#calculate'),
        this._error_item_el = shadowRoot.querySelector('#error-item');
        
        this._byte_array = new Byte_Array();
            
        this._add_btn.addEventListener('click', this.add.bind(this));
        this._calculate.addEventListener('click', ev =>  {
            this.dispatchEvent(new CustomEvent('calculate', {detail: this.calculate(true)}));
        });
        
        this.error_item(true);
    }
    
    connectedCallback()
    {
        if(this.hasAttribute('add-btn'))
            this.show_add(this.getAttribute('add-btn') !== 'false');
        if(this.hasAttribute('calculate-btn'))
            this.show_calculate(this.getAttribute('calculate-btn') !== 'false');
    }
    
    show_add(sw = true)
    {
        this._add_btn.style.display = sw ? 'inline-block' : 'none';
    }
    
    show_calculate(calc = true)
    {
        this._calculate.style.display = calc ? 'inline-block' : 'none';
    }

    add()
    {
        let node = template_item.content.firstElementChild.cloneNode(true);

        let color = generate_random_color();
        node.style.backgroundColor = color;
        node.style.color = color;
        this._custom_contaienr.appendChild(node);                               
        node.querySelector('.custom-close').onclick = ev => {
            node.parentNode.removeChild(node);
        }

        let input = node.querySelector('.custom-input'),
              select_type = node.querySelector('.custom-select'),
              value = node.querySelector('.value');
        const convert_item = ev => {
            if(!input.value === null) return;

            switch(ev.key)
            {
                case 'Escape':
                    input.value = '';
                    break;
            }

            let sel = select_type.selectedOptions[0].value;
            if(!sel)
            {
                console.error('No data selected');
                return;
            }

            try{
                this._byte_array.from(input.value, sel);
                value.textContent = this._byte_array.to(Data_Type.hex.value);
            }catch(e){
                value.textContent = e.message;
            }
        }

        input.addEventListener('keyup', convert_item);
        select_type.addEventListener('change', convert_item);
        
        input.focus();
    }
        
    error_item(status)
    {
        this._error_item_el.style.display = status ? 'none' : 'inline-block';
    }
    
    calculate(set_error = true)
    {
        let data_items = {
            data: [],
            status: true,
            items: []
        }
        let custom_data = [],
            status = true;
        this._custom_contaienr.querySelectorAll('.custom-item').forEach(item => {
           let sel_item = item.querySelector('.custom-select'),
               input_item = item.querySelector('.custom-input');

            let n_data;
            try{
                this._byte_array.from(input_item.value, sel_item.value);
                n_data = this._byte_array.raw();
                data_items.data = data_items.data.concat(n_data);
            } catch(e){
                n_data = {code: e.code, message: e.message, arg: e.arg};
                data_items.status = false;
            }

            data_items.items.push({selected: sel_item.value, 
                         input: input_item.value, 
                         data: n_data,
                         bg: item.style.backgroundColor});
        });

        if(set_error) this.error_item(data_items.status);
        
        return data_items;
    }
});
    
})();