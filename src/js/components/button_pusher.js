export class Button_Pusher extends HTMLElement {
    constructor(buttons = [])
    {
        super(); // always call super() first in the ctor.
        
        if(!(buttons instanceof Array)) throw 'Invalid type';

        // Create shadow DOM for the component.
        let shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = `
            <style>
                :host{
                    display: inline-flex;
                    flex-direction: row;
                    flex-flow: wrap;
                    align-items: stretch;
                    border-radius: 5px;
                    /*border: 1px solid black;*/
                    overflow: hidden;
                }

                .button{
                    border-style: outset;
                    cursor: pointer;
                    flex-grow: 1;
                    background: var(--button-pusher-bt-bg, linen);
                    color: var(--button-pusher-bt-color, black);
                }

                .button:hover{
                    filter: brightness(105%);
                }

                .button:active{
                    font-weight: bolder;
                    filter: brightness(90%);
                    transition: filter 0.1s;
                }

                .selected{
                    border-style: inset;
                    font-weight: bolder;
                    filter: brightness(90%);
                }
            </style>
            
            `;
                
        this._container = shadowRoot;//.querySelector('#container');
        
        this._callback = null;
        this._is_multi = false;
        this._unselect = false;
                
        this._container.addEventListener('click', ev => {
            let b = ev.composedPath()[0];
            if(!b.classList.contains('button')) return;

            if(this._callback)
            {
                if(this._callback(b.value, b))
                    this.set(b.value);
            }
            else
                this.set(b.value, b);
        });
        
        this.add(buttons);
    }
    
    connectedCallback()
    {
        this.hasAttribute('multi')
        {
            if(this.getAttribute('multi') == 'true')
                this._is_multi = true;
        }
        
        this.hasAttribute('unselect')
        {
            if(this.getAttribute('unselect') == 'true')
                this._unselect = true;
        }
        
        this.hasAttribute('onclick')
        {
            if(typeof window[this.getAttribute('onclick')] == 'function')
                this._callback = window[this.getAttribute('onclick')];
        }
    }
    
    set multi(val)
    {
        this._is_multi = Boolean(val);
    }
    
    set callback(val)
    {
        if(typeof val != 'function') return;
        this._callback = val;
    }
    
    add(button)
    {
        if(!(button instanceof Array))
        {
            button = [button];
        }
        
        button.forEach(b => {
            let butt = this._create_button(b);
            this._container.appendChild(butt);
        });
    }
    
    remove(value)
    {
        let butt = null;
        Array.from(this._container.children).some(b => {
            if(value == b.value)
            {
                butt = b;
                return true;
            }
        });
        if(butt) this._container.removeChild(butt);
        
        return butt;
    }
    
    _create_button(button)
    {
        let butt = document.createElement('button');
        butt.value = button.value;
        butt.textContent = button.name;
        butt.dataset.text = button.name;
        butt.classList.add('button');
        if('selected' in button && button.selected)
            butt.classList.add('selected');
        
        if(button.title) butt.title = button.title;

        return butt;
    }
    
    set(value)
    {
        if(this._is_multi)
        {
            Array.from(this._container.children).forEach(b => {
                if(value == b.value)
                    b.classList.toggle('selected');
            });
        }
        else
        {
            if(this._unselect)
            {
                Array.from(this._container.children).forEach(b => {
                    if(value == b.value)
                        b.classList.toggle('selected');
                    else
                        b.classList.remove('selected');
                });
            }
            else
            {
                Array.from(this._container.children).forEach(b => {
                    if(value == b.value)
                        b.classList.add('selected');
                    else
                        b.classList.remove('selected');
                });
            }
        }
    }
    
    unselect_all()
    {
        Array.from(this._container.children).forEach(b => {
            b.classList.remove('selected');
        });
    }
    
    unselect(value)
    {
        Array.from(this._container.children).some(b => {
            if(value == b.value)
            {
                b.classList.remove('selected');
                return true;
            }
        });
    }
            
    select(value)
    {
        if(this._is_multi)
        {
            Array.from(this._container.children).some(b => {
                if(value == b.value)
                {
                    b.classList.add('selected');
                    return true;
                }
            });
        }
        else
        {
            Array.from(this._container.children).forEach(b => {
                if(value == b.value)
                    b.classList.add('selected');
                else
                    b.classList.remove('selected');
            });
        }
    }
    
    selected()
    {
        if(this._is_multi)
        {
            let selected = [];
            Array.from(this._container.children).forEach(b => {
                if(b.classList.contains('selected'))
                {
                    selected.push(b.value);
                }
            });
            return selected;
        }
        else
        {
            let selected = null;
             Array.from(this._container.children).some(b => {
                if(b.classList.contains('selected'))
                {
                    selected = b;
                    return true;
                }
             });
            return selected ? selected.value : selected;
        }
    }
}

customElements.define('button-pusher', Button_Pusher);