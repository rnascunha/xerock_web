import {Byte_Array} from '../../js/libs/byte_array/byte_array.js';
import {Data_Type} from '../../js/libs/byte_array/types.js';

function generate_message_id(data = null)
{
    if(!data || typeof data != 'number')
        return Math.floor(Math.random() * 65535);
    else return (++data) % 65535;
}

customElements.define('message-id-field', class extends HTMLElement {
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
                    width: 7ch;
                    outline: none;
                    border-style: none;
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
                    background-color: white;
                    color: red;
                    transition: background-color 0.5s ease;
                }

                #erase:hover{
                    background-color: red;
                    color: white;
                }
                
                #data-gen{
                    flex-basis: 0;
                    border-style: none;
                    background-color: white;
                    color: lawngreen;
                    transition: background-color 0.5s ease;
                    cursor: pointer;
                }

                #data-gen:hover{
                    background-color: lawngreen;
                    color: white;
                }
            </style>
            
            <input type=text id=data class=field>
            <span id=erase class=field title=clear>&times;</span>
            <button id=data-gen class='field' title='generate MessageID'>&orarr;</button>
            `;
        
        this._value = '';
        this._type = Data_Type.hex.value;
        this._max_size = 2;
                
        this._text_el = shadowRoot.querySelector('#data');
        this._erase_el = shadowRoot.querySelector("#erase");
        this._gen_el = shadowRoot.querySelector('#data-gen');
        
        this.placeholder = 'MID';
        this.title = 'Message ID';
        
        this._erase_el.addEventListener('click', ev => {
            this.text = ''; 
            this._text_el.focus();
        });
                
        this._byte_array = new Byte_Array();
        
        this._text_el.addEventListener('keydown', ev => {
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
                
        this._text_el.addEventListener('focusout', ev => {
            this.text = this._text_el.value;
        });
        
        this._text_el.addEventListener('paste', ev => {
            this.text = (ev.clipboardData || window.clipboardData).getData('text');
            ev.preventDefault();
        });
        
        this._gen_el.addEventListener('click', ev => {
            let gen = this._text_el.value;
            if(gen)
            {
                gen = generate_message_id(+Byte_Array.convert(gen, this._type, Data_Type.uint16be.value));
                this.text = Byte_Array.convert('' + gen, Data_Type.uint16be.value, this._type)
                return;
            }
            gen = generate_message_id();
            this.text = Byte_Array.convert('' + gen, Data_Type.uint16be.value, this._type);
        });
    }
    
    connectedCallback()
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
        
        if(this.hasAttribute('title'))
        {
            this.title = this.getAttribute('title');
        }
        
        if(this.hasAttribute('placeholder'))
        {
            this.placeholder = this.getAttribute('placeholder');
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
        
    byte_array()
    {
        if(!this._text_el.value) return [];
        this._byte_array.from(this._text_el.value, this._type);
        return this._byte_array.raw();
    }
    
    get value()
    {
        if(!this._text_el.value) return '';
        return Byte_Array.convert(this._text_el.value, this._type, Data_Type.uint16be.value);
    }
    
    set text(val)
    {
        if(!val)
        {
            this._text_el.value = '';
            return;
        }
        val = Byte_Array.clear_invalid_char(val, this._type);
        this._byte_array.from(val, this._type);
        if(this._max_size && this._byte_array.size() > this._max_size)
        {
            let raw = this._byte_array.raw();
            this._byte_array.raw(raw.slice(0, this._max_size));
        }
        
        if(this._byte_array.size() < this._max_size)
        {
            let arr = this._byte_array.raw();
            while(arr.length < this._max_size)
            {
                arr.unshift(0);
            }
            this._byte_array.raw(arr);
        }
            
        this._text_el.value = this._byte_array.to(this._type);
    }
});