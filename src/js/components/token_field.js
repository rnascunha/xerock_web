import {Byte_Array} from '../../js/libs/byte_array/byte_array.js';
import {Data_Type} from '../../js/libs/byte_array/types.js';

customElements.define('token-field', class extends HTMLElement {
    constructor()
    {
        super(); // always call super() first in the ctor.

        // Create shadow DOM for the component.
        let shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = `
            <style>
                :host{
                    display: inline-flex;
                    flex-direction: row;
                    align-items: stretch;
                    border-radius: 5px;
                    border: 1px solid black;
                    overflow: hidden;
                }

                .field{
                    border-radius: 0px;
                }

                #data{
                    flex-grow: 1;
                    width: 10ch;
                    outline: none;
                    border-style: none;
                    background-color: var(--token-data-bg, white);
                }

                #erase{
                    display: inline-flex;
                    flex-direction: column;
                    justify-content: center;
                    flex-basis: 0;
                    margin: 0px;
                    padding-right: 5px;
                    padding-left: 5px;
                    cursor: pointer;
                    border-style: none;
                    background-color: var(--token-data-bg, white);
                    color: red;
                    transition: background-color 0.5s ease;
                }

                #erase:hover{
                    background-color: red;
                    color: white;
                }

                #data-size{
                    width: 2ch;
                    background-color: lightgrey;
                    border-style: none;
                    text-align: center;
                }

                #type-hex{
                    border-radius: 0px 5px 5px 0px;
                }

                .data-type{
                    border-style: outset;
                    cursor: pointer;
                }

                .data-type:hover{
                    filter: brightness(105%);
                }

                .data-selected{
                    border-style: inset;
                    font-weight: bolder;
                    filter: brightness(90%);
                }
            </style>
            
            <input type=text id=data class=field>
            <span id=erase class=field title=clear>&times;</span>
            <input type=text id=data-size disabled class=field title='byte size'>
            <button id=type-text class='data-type field' title=text>T</button>
            <button id=type-hex class='data-type field' title=hexa>H</button>
            `;
        
        this._size = 0;
        this._value = '';
        this._type = '';
        this._max_size = 0;
        
        this._type_text_el = shadowRoot.querySelector('#type-text');
        this._type_hex_el = shadowRoot.querySelector('#type-hex');
        this._text_el = shadowRoot.querySelector('#data');
        this._erase_el = shadowRoot.querySelector("#erase");
        this._size_el = shadowRoot.querySelector('#data-size');
        
        this._erase_el.addEventListener('click', ev => {
            this.text = ''; 
            this._text_el.focus();
        });
        
        this._type_text_el.addEventListener('click', ev => {
            this.type = Data_Type.text.value;
            this._text_el.focus();
        });
        
        this._type_hex_el.addEventListener('click', ev => {
            this.type = Data_Type.hex.value;
            this._text_el.focus();
        });
        
        this._byte_array = new Byte_Array();
        
        this._text_el.addEventListener('keydown', ev => {
            if(ev.key == 'Escape')
            {
                this.text = ''; 
                this._text_el.focus();
                return;
            }
            //Checking for command digit
            if(!Byte_Array.is_ascii_char(ev.key) || ev.ctrlKey)
            {
                return;
            }
            //Checking valid digit
            if(!Byte_Array.is_valid_char(ev.key, this._type))
            {
                ev.preventDefault();
                return;
            }
            //Checking for size
            this._byte_array.from(this._text_el.value + ev.key, this._type);
            if(this._max_size && this._byte_array.size() > this._max_size)
            {
                ev.preventDefault();
                return;
            }
        });
        
        this._text_el.addEventListener('keyup', ev => {
            this._byte_array.from(this._text_el.value, this._type);
            this._size_el.value = this._byte_array.size();
        });
        
        this._text_el.addEventListener('focusout', ev => {
            this._byte_array.from(this._text_el.value, this._type);
            this._text_el.value = this._byte_array.to(this._type);
        });
        
        this._text_el.addEventListener('paste', ev => {
            this.text = (ev.clipboardData || window.clipboardData).getData('text');
            ev.preventDefault();
        });
        
        this._init();
    }
    
    _init()
    {
        this.type = Data_Type.text.value;
        if(this.hasAttribute('type'))
        {
            let t = this.getAttribute('type');
            if(t == Data_Type.hex.value || t == Data_Type.text.value)
                this.type = t;
        }
        
        this.text = '';
        if(this.hasAttribute('value'))
        {
            this.text = this.getAttribute('value');
        }
        
        if(this.hasAttribute('max-size'))
        {
            this.max_size = +this.getAttribute('max-size');
        }
        
        if(this.hasAttribute('title'))
        {
            this.title = this.getAttribute('title');
        }
        
        if(this.hasAttribute('placeholder'))
        {
            this.placeholder = this.getAttribute('placeholder');
        }
    }
    
    focus()
    {
        this._text_el.focus();
    }
    
    set type(val)
    {
        if(this._type == val) return;
                
        let old_type = this._type;
        if(val == Data_Type.text.value)
        {
            this._type_hex_el.classList.remove('data-selected');
            this._type_text_el.classList.add('data-selected');
            this._type = Data_Type.text.value;
            
            if(old_type && this._text_el.value)
                this._text_el.value = Byte_Array.convert(this._text_el.value, old_type, this._type);    
        }
        else if(val == Data_Type.hex.value)
        {
            this._type_hex_el.classList.add('data-selected');
            this._type_text_el.classList.remove('data-selected');
            this._type = Data_Type.hex.value;
            
            if(old_type && this._text_el.value)
                this._text_el.value = Byte_Array.convert(this._text_el.value, old_type, this._type);
        }
    }
    
    set placeholder(val)
    {
        this._text_el.placeholder = val;
    }
    
    set title(val)
    {
        this._text_el.title = val;
    }
    
    get type(){ return this._type; }
    
    set max_size(val)
    {
        if(typeof val != 'number') return;
        if(val < 0) val = 0;
        this._max_size = val;
    }
    
    get max_size()
    {
        return this._max_size;
    }

    set_text(val, type = null)
    {
        if(type == null) return;
        this.type = type;
        this.text = val;
    }
    
    byte_array()
    {
        this._byte_array.from(this._text_el.value, this._type);
        return this._byte_array.raw();
    }
    
    get size()
    {
        if(!this._text_el.value) return 0;
        return Byte_Array.parse(this._text_el.value, this._type).length;
    }
    
    set text(val)
    {
        val = Byte_Array.clear_invalid_char(val, this._type);
        this._byte_array.from(val, this._type);
        if(this._max_size && this._byte_array.size() > this._max_size)
        {
            let raw = this._byte_array.raw();
            this._byte_array.raw(raw.slice(0, this._max_size));
        }
        
        this._text_el.value = this._byte_array.to(this._type);
        this._size_el.value = this._byte_array.size();
    }
    
    get text()
    {
        return this._text_el.value;
    }
});