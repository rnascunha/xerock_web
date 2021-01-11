
const default_opts = {
    show_optional: false,
    button_title: 'More options',
}

class Input_Option extends HTMLElement{
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
            border-radius: 6px
        }

        .op-field
        {
            display: inline-flex;
            flex-direction: row;
            flex-wrap: wrap;
            margin: var(--select-option-op-field-margin, 1px);
        }

        .option
        {
            display: inline-flex;
            flex-direction: column;
            margin: var(--select-option-option-margin, 1px)
        }

        .field
        {
            text-align: center;
            padding: 1px;
        }

        .label
        {
            background: var(--select-option-op-label-bg, inherit);
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
            font-weight: bold;
        }

        .value
        {
            background: var(--select-option-op-value-bg, inherit);
            border-bottom-left-radius: 4px;
            border-bottom-right-radius: 4px;
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
    <slot name=before class=op-field></slot>
    <div id=options class=op-field></div>
    <div id=optional-button class=op-field title='${op.button_title}'></div>
    <slot class=op-field></slot>
`; 
        this.show_optional(op.show_optional);
        this.has_optional(false);
        
        this._shadowRoot.querySelector('#optional-button').onclick = ev => {
            if(this._has_optional)
                this.show_optional(!this._show_optional);
        }
    }
    
    add_select(name, options, optional = false)
    {
        console.assert(typeof name === 'string' &&
                        Array.isArray(options), "Wrong arguments");
        
        let div = document.createElement('div');
        div.classList.add('option');
        div.innerHTML = `<div class='field label'>${name}</div>
                        <div class='field value'>
                            <select class=select></select>
                        </div>`;
        
        let select = div.querySelector('.select');
        options.forEach(opt => {
            if(typeof opt === 'string' || typeof opt === 'number')
                opt = {value: opt, name: opt};
            else if(!('value' in opt)) return;
            else if(!('name' in opt))
                opt.name = opt.value;

            let op = document.createElement('option');
            op.textContent = opt.name;
            op.value = opt.value;
            if('default' in opt && opt.default === true)
                op.selected = true;
            
            select.appendChild(op);
        });
        
        this._shadowRoot.querySelector('#options').appendChild(div);

        if(optional){
            div.dataset.optional = true;
            this.has_optional(true);
            this.show_optional(this._show_optional);
        }
        
        return select;
    }
    
    show_optional(op = null)
    {
        if(op !== null)
        {
            this._show_optional = Boolean(op);
            this._shadowRoot
                .querySelector('#options')
                    .querySelectorAll('.option').forEach(op => {
                if('optional' in op.dataset)
                    op.style.display =  this._show_optional ? 'flex' : 'none';
            });
            this._shadowRoot.querySelector('#optional-button').dataset.show = this._show_optional;
        }
        
        return this._show_optional;
    }
    
    has_optional(has = null)
    {
        if(has !== null)
        {
            this._has_optional = Boolean(has);
            this._shadowRoot.querySelector('#optional-button').style.display = this._has_optional ? 'flex' : 'none';
        }
        
        return this._has_optional;
    }
    
    values()
    {
        let labels = this._shadowRoot.querySelectorAll('.label'),
            values = this._shadowRoot.querySelectorAll('.select'),
            value = {};
        
        labels.forEach((v, idx) => {
            value[v.textContent] = values[idx].selectedOptions[0].value;
        });
        
        return value;
    }
    
    names()
    {
        let labels = this._shadowRoot.querySelectorAll('.label'),
            values = this._shadowRoot.querySelectorAll('.select'),
            name = {};
        
        labels.forEach((v, idx) => {
            name[v.textContent] = values[idx].selectedOptions[0].textContent;
        });
        
        return name;
    }
}

customElements.define('input-option', Input_Option);