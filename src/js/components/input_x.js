customElements.define('input-x', class extends HTMLElement{
    constructor(){
        super();
        
        this._shadow = this.attachShadow({mode: 'open'});
        this._shadow.innerHTML = `
            <style>
            :host{
                display: inline-flex;
                flex-wrap: nowrap;
                justify-content: space-between;
                border-radius: 3px;
                border: 1px solid black;
            }

            #content{
                margin: 0px;
                padding: 0px;
            }

            #input{
                flex-grow: 4;
            /*    outline: none;*/
                border: 0px solid;
            }

            #input:focus{
                outline: none;
            }

            #eraseable{
                flex-grow: 1;
                color: red;
                cursor: pointer;
                padding: 2px 5px;
            }

            #eraseable:hover{
                background-color: red;
                color: white;
            }
            </style>
            <div id=content>
                <slot name=input><input type=text id=input></slot>
                <slot name=icons><span id=eraseable>&times;</span></slot>
            </div>`;
        
        this._shadow.querySelector('#eraseable').onclick = ev => {
            this.value = '';
            this._shadow.querySelector('#input').focus();
        }
    }
    
    get eraseable()
    {
        return this._shadow.querySelector('#eraseable');
    }
        
    set value(value)
    {
        this._shadow.querySelector('#input').value = value;
    }
    
    get value()
    {
        return this._shadow.querySelector('#input').value;
    }
});