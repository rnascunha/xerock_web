
const default_opts = {
    show_optional: false,
    button_title: 'More options',
}

export class Optional_Container extends HTMLElement{
    constructor(opts = {})
    {
        super();
        
        let op = {...default_opts, ...opts};
        
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.innerHTML = `
    <style>
        :host
        {
            display: inline-flex;
            flex-direction: row;
            align-items: stretch;
            justify-content: stretch;
            background-color: bisque;
            border-radius: 6px;
        }

        .op-field
        {
            display: inline-flex;
            flex-direction: row;
            flex-wrap: wrap;
            margin: var(--select-option-op-field-margin, 1px);
        }

        #optional-button
        {
            cursor: pointer;
            padding: 3px 5px;
            /*border-radius: 6px;*/
            border-top-right-radius: 6px;
            border-bottom-right-radius: 6px;
            margin: 0px 1px;
            align-self: stretch;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            justify-content: center;

        }

        #optional-button[data-show=true]:after
        {
            content: var(--select-option-icon-show, '\u2770');
        }

        #optional-button[data-show=false]:after
        {
            content: var(--select-option-icon-not-show, '\u2771');
        }

        #optional-button:hover
        {
            background: var(--select-option-hover-bg, inherit);
            filter: brightness(0.9);
        }
    </style>
    <div id=options class=op-field>
        <slot></slot>
    </div>
    <div id=optional-button class=op-field title='${op.button_title}'></div>
`; 
        
        this._options = this._shadowRoot.querySelector('#options').querySelector('slot');
        this._button = this._shadowRoot.querySelector('#optional-button');

        this._show_optional = op.show_optional;
        this.has_optional(false);
                
        this._button.onclick = ev => {
            if(this._has_optional)
                this.show_optional(!this._show_optional);
        }
    }
    
    connectedCallback()
    {
        [...this._options.assignedElements()].forEach(op => {
            if(op.hasAttribute('optional')) this.has_optional(true);
        });
        this.show_optional(this._show_optional);
    }
    
    add(container, optional = false)
    {
//        console.assert(container instanceof Element || container instanceof HTMLDocument, "Wrong arguments");
                
        this.appendChild(container);
        this._set_optional(container, optional);
    }
    
    _set_optional(container, set = true, update = true)
    {
        if(set)
        {
            container.setAttribute('optional', '');
            this.has_optional(true);
        }
        else
            container.removeAttribute('optional');
        
        if(update)
            this.show_optional(this._show_optional);
    }
    
    show_optional(op = null)
    {
        if(op !== null)
        {
            this._show_optional = Boolean(op);
            [...this._options.assignedElements()].forEach(op => {
                op.style.display = !op.hasAttribute('optional') || this._show_optional ? 'flex' : 'none';
            });
            this._button.dataset.show = this._show_optional;
        }
        
        return this._show_optional;
    }
    
    has_optional(has = null)
    {
        if(has !== null)
        {
            this._has_optional = Boolean(has);
            this._button.style.display = this._has_optional ? 'flex' : 'none';
        }
        
        return this._has_optional;
    }
}

window.customElements.define('optional-container', Optional_Container);